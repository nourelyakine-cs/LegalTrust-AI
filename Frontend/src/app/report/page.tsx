"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Indicator = {
  title: string;
  level: "normal" | "warning" | "danger";
  description: string;
};

type AnalysisResult = {
  fileName: string;
  fileType: string;
  fileSize: number;
  kind: "image" | "pdf";
  metadata: Record<string, string | number | boolean | null>;
  indicators: Indicator[];
  overallStatus: string;
  summary: string;
};

const limitations = [
  "This analysis is based on available metadata and basic technical checks only.",
  "It does not prove authenticity or detect all forms of sophisticated manipulation.",
  "Results should be used as decision-support indicators, not as definitive legal evidence.",
];

const legalInterpretation = [
  "These findings describe technical traces found in the file. They do not establish authenticity, authorship, ownership, or legal admissibility.",
  "A warning means the indicator deserves human review. It is not a finding that the file was forged or unlawfully altered.",
  "Missing or incomplete metadata alone does not prove manipulation. Metadata can be absent because of export, conversion, privacy settings, or the tool that created the file.",
  "Consistent metadata does not prove that the file is genuine. This profile supports professional assessment and must be read together with the context of the case.",
];

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function statusStyles(status: string) {
  if (status === "Suspicious signals") return "bg-red-100 text-red-800";
  if (status === "Attention required") return "bg-amber-100 text-amber-800";
  return "bg-green-100 text-green-800";
}

function levelStyles(level: Indicator["level"]) {
  if (level === "danger") {
    return { box: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-800", label: "Suspicious" };
  }
  if (level === "warning") {
    return { box: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-800", label: "Attention" };
  }
  return { box: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-800", label: "Normal" };
}

export default function ReportPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("analysisResult");
    if (raw) setResult(JSON.parse(raw) as AnalysisResult);

    setAnalyzedAt(
      new Date().toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Verification Profile
            </h1>
            {result && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles(result.overallStatus)}`}>
                {result.overallStatus}
              </span>
            )}
          </div>
          <p className="text-slate-600 text-sm">
            {result
              ? `${result.fileName} • ${result.fileType} • ${formatBytes(result.fileSize)} • Analyzed on ${analyzedAt}`
              : "No file analyzed yet"}
          </p>
        </div>

        {!result ? (
          <section className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <p className="text-slate-700">
              No analysis result found. Upload a file to extract its metadata.
            </p>
            <Link
              href="/upload"
              className="inline-block mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
            >
              Upload a file
            </Link>
          </section>
        ) : (
          <>
            <section className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <h2 className="font-semibold text-slate-900 mb-3">Summary</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
            </section>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <section className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Technical Metadata</h2>
                <div className="space-y-3">
                  {Object.entries(result.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm gap-4">
                      <span className="text-slate-500 shrink-0">{key}</span>
                      <span className="text-slate-900 font-medium text-right break-all">
                        {formatValue(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Reliability Indicators</h2>
                <div className="space-y-4">
                  {(result.indicators ?? []).map((indicator) => {
                    const styles = levelStyles(indicator.level);
                    return (
                      <div key={indicator.title} className={`p-4 rounded-lg border ${styles.box}`}>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <h3 className="font-medium text-slate-900 text-sm">{indicator.title}</h3>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${styles.badge}`}
                          >
                            {styles.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{indicator.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        )}

        <section className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-3">Legal Interpretation</h2>
          <ul className="space-y-2">
            {legalInterpretation.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-700">
                <span className="text-slate-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-slate-100 border border-slate-200 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-slate-900 mb-3">Limitations of this analysis</h2>
          <ul className="space-y-2">
            {limitations.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-700">
                <span className="text-slate-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/upload"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Analyze another file
          </Link>
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-lg transition-colors duration-200"
          >
            Print / Save as PDF
          </button>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 mt-6">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-slate-500">
          LegalTrust AI — Academic Prototype • This report does not constitute legal advice or
          proof of authenticity
        </div>
      </footer>
    </div>
  );
}