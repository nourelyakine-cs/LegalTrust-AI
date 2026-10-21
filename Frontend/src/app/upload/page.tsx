"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptedTypes = ["image/jpeg", "image/png", "application/pdf"];
  const acceptedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    setError("");

    const fileName = file.name.toLowerCase();
    const isValidExtension = acceptedExtensions.some((ext) => fileName.endsWith(ext));
    const isValidType = acceptedTypes.includes(file.type);

    if (!isValidExtension && !isValidType) {
      setError("Unsupported file type. Only JPG, PNG and PDF files are allowed.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Analysis failed.");
        setIsSubmitting(false);
        return;
      }

      sessionStorage.setItem("analysisResult", JSON.stringify(data));
      router.push("/analysis");
    } catch {
      setError("Could not reach the analysis service.");
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>

            <div className="h-5 w-px bg-slate-200" />

            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm tracking-tight">LT</span>
              </div>
              <span className="font-semibold text-slate-900 text-lg tracking-tight">
                LegalTrust AI
              </span>
            </Link>
          </div>
          <span className="text-sm text-slate-500 font-medium">Prototype</span>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
            Upload a file for analysis
          </h1>
          <p className="text-slate-600">
            Supported formats: <span className="font-medium text-slate-800">JPG, PNG, PDF</span>{" "}
            (max 10 MB)
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : selectedFile
              ? "border-green-400 bg-green-50"
              : error
              ? "border-red-300 bg-red-50"
              : "border-slate-300 bg-white hover:border-slate-400"
          }`}
        >
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isSubmitting}
          />

          {!selectedFile ? (
            <>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
                  error ? "bg-red-100" : "bg-slate-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-8 h-8 ${error ? "text-red-500" : "text-slate-500"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-slate-700 font-medium mb-1">Drag & drop your file here</p>
              <p className="text-sm text-slate-500">or click to browse</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-900 font-medium mb-1">{selectedFile.name}</p>
              <p className="text-sm text-slate-500 mb-4">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Remove file
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Cancel
          </Link>

          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || isSubmitting}
            className={`px-8 py-2.5 rounded-lg font-medium transition-colors duration-200 ${
              selectedFile && !isSubmitting
                ? "bg-slate-900 hover:bg-slate-800 text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Extracting metadata..." : "Start Analysis"}
          </button>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1.5">
            <li>• Technical metadata will be extracted</li>
            <li>• Potential anomalies will be identified</li>
            <li>• A structured Verification Profile will be generated</li>
          </ul>
        </div>
      </main>
    </div>
  );
}