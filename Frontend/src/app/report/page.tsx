"use client";

import Link from "next/link";

export default function ReportPage() {
  // Mock data – will later come from real analysis + LLM
  const report = {
    fileName: "contract_scan_2024.pdf",
    fileType: "PDF",
    fileSize: "1.24 MB",
    analyzedAt: "October 21, 2026 – 00:38",
    overallStatus: "Attention Required",
    summary:
      "The file contains several technical indicators that warrant closer review. While no definitive proof of manipulation was found, inconsistencies in timestamps and editing software traces were detected.",
    metadata: [
      { label: "File Type", value: "PDF 1.7" },
      { label: "Author", value: "John Smith" },
      { label: "Creator", value: "Adobe Acrobat Pro 2024" },
      { label: "Creation Date", value: "2024-03-12 14:22:08" },
      { label: "Modification Date", value: "2024-03-10 09:15:44" },
      { label: "Producer", value: "Adobe PDF Library 17.0" },
    ],
    indicators: [
      {
        title: "Timestamp Inconsistency",
        level: "warning",
        description:
          "The modification date (March 10) is earlier than the creation date (March 12). This is technically inconsistent and may indicate manual editing of metadata.",
      },
      {
        title: "Editing Software Detected",
        level: "warning",
        description:
          "The file was processed with Adobe Acrobat Pro. While common, this confirms the document has been opened and potentially modified after original creation.",
      },
      {
        title: "Author Information Present",
        level: "normal",
        description:
          "Author metadata is present and consistent. No generic or suspicious author names were found.",
      },
      {
        title: "File Structure",
        level: "normal",
        description:
          "The internal PDF structure appears standard. No unusual compression or embedded objects were detected in this prototype analysis.",
      },
    ],
    limitations: [
      "This analysis is based on available metadata and basic technical checks only.",
      "It does not prove authenticity or detect all forms of sophisticated manipulation.",
      "Results should be used as decision-support indicators, not as definitive legal evidence.",
    ],
  };

  const getLevelStyles = (level: string) => {
    switch (level) {
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          badge: "bg-amber-100 text-amber-800",
          label: "Attention",
        };
      case "danger":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          badge: "bg-red-100 text-red-800",
          label: "Suspicious",
        };
      default:
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          badge: "bg-green-100 text-green-800",
          label: "Normal",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LT</span>
              </div>
              <span className="font-semibold text-slate-900 text-lg">LegalTrust AI</span>
            </Link>
          </div>
          <div className="text-sm text-slate-500">Prototype</div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold text-slate-900">Verification Profile</h1>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
              {report.overallStatus}
            </span>
          </div>
          <p className="text-slate-600 text-sm">
            {report.fileName} • {report.fileType} • {report.fileSize} • Analyzed on {report.analyzedAt}
          </p>
        </div>

        {/* Summary */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-3">Summary</h2>
          <p className="text-slate-700 leading-relaxed">{report.summary}</p>
        </section>

        {/* Two columns: Metadata + Indicators */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Metadata */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Technical Metadata</h2>
            <div className="space-y-3">
              {report.metadata.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-900 font-medium text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Indicators */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Reliability Indicators</h2>
            <div className="space-y-4">
              {report.indicators.map((indicator) => {
                const styles = getLevelStyles(indicator.level);
                return (
                  <div
                    key={indicator.title}
                    className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-900 text-sm">{indicator.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
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

        {/* Limitations */}
        <section className="bg-slate-100 border border-slate-200 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-slate-900 mb-3">Limitations of this analysis</h2>
          <ul className="space-y-2">
            {report.limitations.map((item, index) => (
              <li key={index} className="flex gap-2 text-sm text-slate-700">
                <span className="text-slate-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/upload"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
          >
            Analyze another file
          </Link>
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Print / Save as PDF
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 mt-10">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-slate-500">
          LegalTrust AI — Academic Prototype • This report does not constitute legal advice or proof of authenticity
        </div>
      </footer>
    </div>
  );
}