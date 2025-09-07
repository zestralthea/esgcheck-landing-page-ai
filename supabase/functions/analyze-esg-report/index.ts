// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";
const PDFMONKEY_API_KEY = Deno.env.get("PDFMONKEY_API_KEY") || "";
const PDFMONKEY_TEMPLATE_ID = Deno.env.get("PDFMONKEY_TEMPLATE_ID") || "";

console.log("Environment check:", {
  supabaseUrl: supabaseUrl ? "set" : "missing",
  supabaseKey: supabaseKey ? "set" : "missing",
  openaiKey: openaiKey ? "set" : "missing",
  pdfmonkeyKey: PDFMONKEY_API_KEY ? "set" : "missing",
  pdfmonkeyTemplate: PDFMONKEY_TEMPLATE_ID ? "set" : "missing"
});

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({
  apiKey: openaiKey
});

// Enhanced CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept, origin",
  "Access-Control-Max-Age": "86400"
};

serve(async (req) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      headers: CORS_HEADERS,
      status: 204 
    });
  }

  try {
    console.log("Parsing request body");
    const { report_id, report_text, framework = "GRI" } = await req.json();
    
    console.log("Request data:", { 
      report_id: report_id ? "provided" : "missing", 
      report_text_length: report_text?.length || 0,
      framework 
    });
    
    if (!report_text) {
      console.error("Missing report_text in request");
      return new Response(JSON.stringify({
        error: "Missing report_text"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    }

    // 1. Create embedding for report
    console.log("Creating embedding for report text");
    
    let guidelinesContext = "No guidelines found for the specified framework.";
    
    try {
      const embeddingResp = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: report_text
      });
      const reportEmbedding = embeddingResp.data[0].embedding;
      console.log(`Successfully created embedding with ${reportEmbedding.length} dimensions`);

      // 2. Query similar chunks from Supabase
      console.log(`Querying match_guideline_chunks with framework: ${framework}`);
      
      // Define chunks at the outer scope
      let chunks: any[] | null = null;
      
      try {
        // Try calling the match_guideline_chunks function directly
        console.log("Attempting to call match_guideline_chunks...");
        const { data: matchedChunks, error } = await supabase.rpc("match_guideline_chunks", {
          query_embedding: reportEmbedding,
          match_threshold: 0.75,
          match_count: 10,
          framework_name: framework
        });
        
        // Assign to the outer scoped variable
        chunks = matchedChunks;
        
        if (error) {
          console.error("Error querying match_guideline_chunks:", error);
          
          // Additional diagnostic info
          console.error("Error details:", {
            message: error.message,
            hint: error.hint,
            code: error.code,
            details: error.details
          });
          
          // Don't throw yet, log all potential issues first
          console.error(`Failed to query guidelines: ${error.message} (Code: ${error.code})`);
          
          // Try a simpler query to test database connectivity
          console.log("Testing database connectivity with simple query...");
          const { data: testData, error: testError } = await supabase
            .from('esg_guidelines')
            .select('id')
            .limit(1);
            
          if (testError) {
            console.error("Database connectivity test failed:", testError);
          } else {
            console.log("Database connectivity test succeeded:", testData);
          }
          
          // Now throw the original error
          throw new Error(`Failed to query guidelines: ${error.message} (Code: ${error.code})`);
        }
        
        console.log(`Found ${chunks?.length || 0} matching guideline chunks`);
        
        if (!chunks || chunks.length === 0) {
          console.warn("No matching chunks found. Using default guidelines.");
        }
      } catch (matchError) {
        console.error("Exception during guideline matching:", matchError);
        throw new Error(`Guideline matching failed: ${matchError.message}`);
      }
      
      // Merge the most relevant chunks if we have any
      if (chunks && chunks.length > 0) {
        guidelinesContext = chunks.map((c) => c.content).join("\n\n");
      }
    } catch (embeddingError) {
      console.error("Error in embedding or matching process:", embeddingError);
      throw embeddingError;
    }
    
    console.log("Guidelines context assembled");

    // 3. Construct the final prompt
    console.log("Constructing prompt for OpenAI");
    const systemPrompt = `
You are an ESG analysis assistant. 
Review the following ESG report and compare it with the guidelines provided. 
Extract material topics, identify gaps against the standards, and provide a structured JSON output with:
- reasoning_steps
- findings.extracted_material_topics
- findings.gri_gaps
- findings.scoring_rationale
- findings.final_score
- findings.summary

Important:
- Base your evaluation ONLY on the provided report text and these guidelines.
- Use equal weights for Environmental, Social, Governance (33% each).
- Provide JSON only, no additional explanation.
`;

    const finalPrompt = `
=== ESG REPORT ===
${report_text}

=== GUIDELINE REFERENCE (from ${framework}) ===
${guidelinesContext}
`;

    // 4. Call OpenAI with structured output request
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: finalPrompt
        }
      ],
      response_format: {
        type: "json_object"
      }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    // 5. Generate PDF report using PDFMonkey
    const pdfmonkeyResponse = await fetch("https://api.pdfmonkey.io/api/v1/documents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PDFMONKEY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        document: {
          document_template_id: PDFMONKEY_TEMPLATE_ID,
          status: "pending",
          payload: {
            analysis: analysis,
            reportTitle: analysis.findings?.summary || "ESG Report Analysis",
            score: analysis.findings?.final_score || "N/A",
            materialTopics: analysis.findings?.extracted_material_topics || [],
            gaps: analysis.findings?.gri_gaps || [],
            scoringRationale: analysis.findings?.scoring_rationale || "",
            reasoningSteps: analysis.reasoning_steps || "",
            analyzedAt: new Date().toISOString(),
            framework: framework
          }
        }
      })
    });

    const pdfData = await pdfmonkeyResponse.json();

    // 6. Save the analysis and PDF document reference to Supabase
    if (report_id) {
      await supabase.from('esg_report_analyses').insert({
        report_id: report_id,
        analysis_data: analysis,
        pdf_document_id: pdfData.document?.id,
        framework: framework,
        created_at: new Date().toISOString()
      });

      // Update the report status
      await supabase.from('esg_reports').update({
        status: 'completed',
        analysis_status: 'completed'
      }).eq('id', report_id);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      pdf_document: pdfData.document
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      }
    });
    
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      }
    });
  }
});