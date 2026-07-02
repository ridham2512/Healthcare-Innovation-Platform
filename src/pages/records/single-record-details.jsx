import React, { useState, useRef, useCallback } from "react";
import {
  IconChevronRight,
  IconFileUpload,
  IconLoader2,
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconClock,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../context/index";
import ReactMarkdown from "react-markdown";
import FileUploadModal from "./components/file-upload-modal";
import RecordDetailsHeader from "./components/record-details-header";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

const SUPPORTED_INLINE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];
const SUPPORTED_PDF = "application/pdf";
const GEMINI_MODEL = "gemini-2.0-flash";
const MAX_IMAGE_DIMENSION = 1024; // resize large images to max 1024px
const MAX_FILE_MB = 10;

// ── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isQuotaError(err) {
  const msg = (err?.message || "").toLowerCase();
  return (
    msg.includes("quota") ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate limit") ||
    msg.includes("429") ||
    msg.includes("exhausted")
  );
}

/**
 * Compress an image File to a smaller JPEG base64 string.
 * Resizes to MAX_IMAGE_DIMENSION × MAX_IMAGE_DIMENSION max, quality 0.75.
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          height = Math.round((height / width) * MAX_IMAGE_DIMENSION);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width / height) * MAX_IMAGE_DIMENSION);
          height = MAX_IMAGE_DIMENSION;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL("image/jpeg", 0.75).split(",")[1];
      resolve(base64);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Read any file as base64 (used for PDF). */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Call Gemini with a single retry on quota errors.
 * onStatus(msg) is called with status text the UI can show.
 */
async function callGemini(genAI, contentFn, onStatus) {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const MAX_RETRIES = 1;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (onStatus) onStatus(attempt === 0 ? "Analyzing…" : "Retrying…");
      const result = await contentFn(model);
      const text = result.response.text();
      if (!text || text.trim().length === 0)
        throw new Error("Gemini returned an empty response. Please try again.");
      return text;
    } catch (err) {
      if (isQuotaError(err) && attempt < MAX_RETRIES) {
        console.warn("⏳ Rate limited — waiting 65s before one retry…");
        // Count down in UI
        for (let s = 65; s > 0; s--) {
          if (onStatus) onStatus(`Rate limited — retrying in ${s}s…`);
          await sleep(1000);
        }
        continue;
      }
      throw err;
    }
  }
  throw new Error(
    "QUOTA_FINAL: Your Gemini API key has reached its limit. Please create a new API key at aistudio.google.com or wait a few minutes."
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

function SingleRecordDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateRecord } = useStateContext();
  const state = location.state;

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(state?.analysisResult || "");
  const [filename, setFilename] = useState("");
  const [filetype, setFileType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [processError, setProcessError] = useState("");
  const [statusMsg, setStatusMsg] = useState(""); // live status shown during upload

  // Guard: direct URL navigation
  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-full bg-yellow-100 p-5 mb-4">
          <IconAlertTriangle size={40} className="text-yellow-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700">Record Not Found</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-sm">
          Please navigate to this page through your{" "}
          <a href="/medical-records" className="text-blue-500 underline">
            Medical Records
          </a>
          .
        </p>
        <button
          onClick={() => navigate("/medical-records")}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Go to Medical Records
        </button>
      </div>
    );
  }

  const handleOpenModal = () => {
    setUploadError("");
    setStatusMsg("");
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    if (!uploading) setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const mime = selectedFile.type;
    if (!SUPPORTED_INLINE_TYPES.includes(mime) && mime !== SUPPORTED_PDF) {
      setUploadError(`Unsupported file type. Please upload PNG, JPEG, WebP, or PDF.`);
      return;
    }
    if (selectedFile.size > MAX_FILE_MB * 1024 * 1024) {
      setUploadError(`File too large. Maximum size is ${MAX_FILE_MB}MB.`);
      return;
    }
    setUploadError("");
    setFileType(mime);
    setFilename(selectedFile.name);
    setFile(selectedFile);
  };

  const handleFileUpload = async () => {
    if (!file) { setUploadError("Please select a file first."); return; }
    if (!geminiApiKey || geminiApiKey === "your_gemini_api_key_here") {
      setUploadError("⚠️ Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env and restart the dev server.");
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    setUploadError("");
    setProcessError("");
    setStatusMsg("Preparing file…");

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);

      // Compress images; read PDFs as-is
      let base64Data;
      let mimeType;
      if (SUPPORTED_INLINE_TYPES.includes(filetype)) {
        setStatusMsg("Compressing image…");
        base64Data = await compressImage(file);
        mimeType = "image/jpeg"; // always JPEG after compression
      } else {
        setStatusMsg("Reading PDF…");
        base64Data = await readFileAsBase64(file);
        mimeType = "application/pdf";
      }

      const contentParts = [{ inlineData: { data: base64Data, mimeType } }];

      const prompt = `You are an expert medical report analyst and healthcare advisor.
Analyze the provided medical document and respond with these exact sections:

## Summary of Findings
Briefly describe what this document is about.

## Key Diagnoses / Observations
List the main medical findings, test results, or conditions identified.

## Personalized Treatment Plan
Provide specific, actionable steps including:
- Medications or supplements to consider
- Lifestyle changes (diet, exercise, sleep)
- Follow-up tests or specialist consultations
- Timeline for each action

## Important Warnings & Recommendations
Highlight anything urgent or important the patient must know.

Write in plain language a patient can understand. Be clear and thorough.`;

      const text = await callGemini(
        genAI,
        (m) => m.generateContent([prompt, ...contentParts]),
        setStatusMsg
      );

      setAnalysisResult(text);
      setStatusMsg("Saving…");
      await updateRecord({
        documentID: state.id,
        analysisResult: text,
        kanbanRecords: state.kanbanRecords || "",
      });

      setUploadSuccess(true);
      setStatusMsg("");
      setIsModalOpen(false);
      setFilename("");
      setFile(null);
      setFileType("");
    } catch (error) {
      console.error("Upload error:", error);
      const msg = error?.message || "";

      let errorMsg;
      if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
        errorMsg = "❌ Invalid API key. Check your VITE_GEMINI_API_KEY in .env.";
      } else if (msg.includes("PERMISSION_DENIED")) {
        errorMsg = "❌ API key permission denied. Ensure Gemini API is enabled in Google AI Studio.";
      } else if (msg.includes("QUOTA_FINAL")) {
        errorMsg = "🔑 Your API key quota is exhausted. Please:\n1. Go to aistudio.google.com/app/apikey\n2. Click 'Create API key' → 'Create new project'\n3. Paste the new key in your .env file\n4. Restart the dev server";
      } else if (isQuotaError(error)) {
        errorMsg = "⏳ Rate limit still active. Please wait a few minutes before trying again, or create a new API key.";
      } else if (msg.includes("inlineData") || msg.includes("mimeType")) {
        errorMsg = "❌ File format rejected. Please use PNG, JPEG, or PDF.";
      } else {
        errorMsg = "❌ " + (msg || "Unknown error. Please try again.");
      }

      setUploadError(errorMsg);
      setUploadSuccess(false);
      setStatusMsg("");
    } finally {
      setUploading(false);
    }
  };

  const processTreatmentPlan = async () => {
    if (!analysisResult) { setProcessError("Please upload and analyze a medical report first."); return; }
    if (!geminiApiKey || geminiApiKey === "your_gemini_api_key_here") {
      setProcessError("Gemini API key is not configured.");
      return;
    }

    setIsProcessing(true);
    setProcessError("");

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);

      const prompt = `Based on this medical treatment plan:

${analysisResult}

Create a Kanban board JSON for the patient to track treatment tasks.

Return ONLY raw JSON (no markdown, no code fences):

{
  "columns": [
    { "id": "todo", "title": "To Do" },
    { "id": "doing", "title": "In Progress" },
    { "id": "done", "title": "Done" }
  ],
  "tasks": [
    { "id": "1", "columnId": "todo", "content": "Schedule appointment with specialist" }
  ]
}

Create 8-12 specific, actionable tasks from the treatment plan. Start task IDs from "1".`;

      const text = await callGemini(genAI, (m) => m.generateContent(prompt), () => {});
      let cleaned = text.trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error("AI returned invalid JSON. Please try again.");
      }

      if (!parsed.columns || !parsed.tasks) throw new Error("AI response is missing fields. Please try again.");

      await updateRecord({
        documentID: state.id,
        kanbanRecords: JSON.stringify(parsed),
        analysisResult,
      });

      navigate("/screening-schedules", { state: parsed });
    } catch (error) {
      console.error("Treatment plan error:", error);
      setProcessError(error.message || "Failed to generate treatment plan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const apiKeyMissing = !geminiApiKey || geminiApiKey === "your_gemini_api_key_here";

  return (
    <div className="flex flex-col gap-6">
      {/* Upload button */}
      <div className="flex flex-wrap gap-3 mt-2">
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-x-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-blue-300 transition"
        >
          <IconFileUpload size={18} />
          Upload Medical Report
        </button>
      </div>

      <FileUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFileChange={handleFileChange}
        onFileUpload={handleFileUpload}
        uploading={uploading}
        uploadSuccess={uploadSuccess}
        uploadError={uploadError}
        filename={filename}
        statusMsg={statusMsg}
      />

      <RecordDetailsHeader recordName={state.recordName} />

      {/* API key missing banner */}
      {apiKeyMissing && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <IconInfoCircle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Gemini API Key Required</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Add <code className="bg-amber-100 px-1 rounded">VITE_GEMINI_API_KEY</code> to your{" "}
              <code className="bg-amber-100 px-1 rounded">.env</code> file and restart the dev server.
              Get a free key at{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-medium">
                aistudio.google.com
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Process error */}
      {processError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 whitespace-pre-line">
          {processError}
        </div>
      )}

      {/* Upload success */}
      {uploadSuccess && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <IconCheck size={18} className="text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Report analyzed successfully!</p>
        </div>
      )}

      {/* Analysis Result Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-xl font-bold text-blue-900">🤖 AI Medical Analysis</h2>
          <p className="text-sm text-gray-500 mt-0.5">Powered by Google Gemini 2.0 Flash</p>
        </div>

        <div className="px-6 py-5">
          {analysisResult ? (
            <div className="prose max-w-none">
              <ReactMarkdown>{analysisResult}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <IconFileUpload size={44} className="mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">No analysis yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Upload a PNG, JPEG, WebP, or PDF medical report to get an AI-powered analysis.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {analysisResult ? "Generate a Kanban treatment board from this analysis" : "Upload a report to unlock"}
          </p>
          <button
            type="button"
            onClick={processTreatmentPlan}
            disabled={processing || !analysisResult}
            className="inline-flex items-center gap-x-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {processing ? (
              <><IconLoader2 size={16} className="animate-spin" /> Generating…</>
            ) : (
              <>Generate Treatment Plan <IconChevronRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SingleRecordDetails;
