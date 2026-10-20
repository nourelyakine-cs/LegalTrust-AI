import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-tight">LT</span>
            </div>
            <span className="font-semibold text-slate-900 text-lg tracking-tight">
              LegalTrust AI
            </span>
          </div>
          <span className="text-sm text-slate-500 font-medium">Prototype</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6">
          <section className="pt-20 pb-16 text-center">
            <div className="inline-block mb-6 px-3.5 py-1.5 bg-blue-50 text-blue-800 text-sm font-medium rounded-full border border-blue-100">
              LegalTech • AI-Assisted Verification
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
              Assess the reliability
              <br />
              of digital files
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              LegalTrust AI generates a structured{" "}
              <strong className="text-slate-800">Verification Profile</strong> based on
              metadata and technical indicators. A decision-support tool designed for
              legal professionals.
            </p>

            <Link
              href="/upload"
              className="inline-flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 py-3.5 rounded-lg transition-colors duration-200"
            >
              Analyze a file
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </section>

          {/* Features */}
          <section className="grid md:grid-cols-3 gap-6 pb-20">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Technical Extraction</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Analysis of metadata, timestamps, and technical indicators from the file.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Clear Indicators</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Detection of potential anomalies with understandable explanations.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Decision Support</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A structured report to support human assessment, without automated decisions.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-slate-500">
          LegalTrust AI — Academic Prototype • Does not constitute legal advice
        </div>
      </footer>
    </div>
  );
}