// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Environment variables
const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || ""
});
const PDFMONKEY_API_KEY = Deno.env.get("PDFMONKEY_API_KEY") || "";
const PDFMONKEY_TEMPLATE_ID = Deno.env.get("PDFMONKEY_TEMPLATE_ID") || "";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: CORS_HEADERS
    });
  }
  try {
    const { report_id, report_text, framework = "GRI" } = await req.json();
    if (!report_text) {
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
    const embeddingResp = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: report_text
    });
    const reportEmbedding = embeddingResp.data[0].embedding;
    // 2. Query similar chunks from Supabase
    const { data: chunks, error } = await supabase.rpc("match_guideline_chunks", {
      query_embedding: reportEmbedding,
      match_threshold: 0.75,
      match_count: 10,
      framework_name: framework
    });
    if (error) throw error;
    // Merge the most relevant chunks
    const guidelinesContext = chunks.map((c)=>c.content).join("\n\n");
    // 3. Construct the final prompt
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
  } catch (err) {
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
