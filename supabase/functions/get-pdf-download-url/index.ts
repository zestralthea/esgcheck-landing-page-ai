// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);
const PDFMONKEY_API_KEY = Deno.env.get("PDFMONKEY_API_KEY") || "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { pdf_document_id } = await req.json();
    
    if (!pdf_document_id) {
      return new Response(JSON.stringify({
        error: "Missing pdf_document_id"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    }

    // Get the document status from PDFMonkey
    const statusResponse = await fetch(`https://api.pdfmonkey.io/api/v1/documents/${pdf_document_id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PDFMONKEY_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const statusData = await statusResponse.json();
    
    // If the document is not yet generated, trigger its generation
    if (statusData.document?.status !== "success") {
      const generateResponse = await fetch(`https://api.pdfmonkey.io/api/v1/documents/${pdf_document_id}/generate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PDFMONKEY_API_KEY}`,
          "Content-Type": "application/json"
        }
      });
      
      // Wait a moment for PDFMonkey to generate the document
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check status again
      const updatedStatusResponse = await fetch(`https://api.pdfmonkey.io/api/v1/documents/${pdf_document_id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${PDFMONKEY_API_KEY}`,
          "Content-Type": "application/json"
        }
      });
      
      const updatedStatusData = await updatedStatusResponse.json();
      
      if (!updatedStatusData.document?.download_url) {
        return new Response(JSON.stringify({
          error: "PDF generation failed or is still in progress. Please try again later."
        }), {
          status: 202, // Accepted, but processing
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS
          }
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        download_url: updatedStatusData.document.download_url
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    }
    
    // Document already generated, return the download URL
    return new Response(JSON.stringify({
      success: true,
      download_url: statusData.document.download_url
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      }
    });
    
  } catch (err: any) {
    console.error("Error:", err);
    return new Response(JSON.stringify({
      error: err.message || "Failed to get PDF download URL"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      }
    });
  }
});