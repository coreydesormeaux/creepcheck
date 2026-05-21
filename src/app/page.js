"use client";

import { useMemo, useRef, useState } from "react";

const sampleTransactions = [
  { Date: "2026-05-01", Description: "NETFLIX.COM", Amount: "-22.99" },
  { Date: "2026-04-01", Description: "NETFLIX.COM", Amount: "-18.99" },
  { Date: "2026-05-03", Description: "SPOTIFY FAMILY", Amount: "-18.99" },
  { Date: "2026-04-03", Description: "SPOTIFY FAMILY", Amount: "-16.99" },
  { Date: "2026-05-08", Description: "ADOBE CREATIVE CLOUD", Amount: "-78.99" },
  { Date: "2026-04-08", Description: "ADOBE CREATIVE CLOUD", Amount: "-78.99" },
  { Date: "2026-05-10", Description: "APPLE STORAGE", Amount: "-3.99" },
  { Date: "2026-04-10", Description: "APPLE STORAGE", Amount: "-3.99" },
];

const featuredCharges = [
  { name: "Netflix", price: "$22.99", change: "+$4 increase" },
  { name: "Spotify Family", price: "$18.99", change: "+$2 increase" },
  { name: "Adobe Creative Cloud", price: "$78.99", change: "High annual cost" },
  { name: "Apple Storage", price: "$3.99", change: "Duplicate cloud storage" },
];

const valueCards = [
  {
    title: "Private by default",
    text: "CreepCheck scans CSV exports in your browser. No bank login required for this MVP.",
  },
  {
    title: "Built for clarity",
    text: "The first report focuses on recurring charges, silent price increases, and the subscriptions worth reviewing.",
  },
  {
    title: "Ready to sell",
    text: "Start with a free scan, collect email interest, then charge for deeper reports and cancellation help.",
  },
];

const steps = [
  {
    step: "01",
    title: "Export your CSV",
    text: "Download transactions from your bank or card provider. Most banks include date, description, and amount columns.",
  },
  {
    step: "02",
    title: "Upload securely",
    text: "CreepCheck groups repeated merchants and compares the latest charges against older ones.",
  },
  {
    step: "03",
    title: "See the leaks",
    text: "Review monthly totals, annual cost, and the subscriptions that appear to be getting more expensive.",
  },
];

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function normalizeKey(row, candidates) {
  const match = Object.keys(row).find((key) =>
    candidates.some((candidate) =>
      key.toLowerCase().trim().includes(candidate)
    )
  );

  return match ? row[match] : "";
}

function parseAmount(value) {
  const parsed = Number(String(value || "").replace(/[^0-9.-]/g, ""));

  return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
}

function cleanMerchant(value) {
  return String(value || "Unknown merchant")
    .replace(/\d{2,}/g, "")
    .replace(/[*#._-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function detectRecurringCharges(transactions) {
  const grouped = transactions.reduce((groups, row) => {
    const merchant = cleanMerchant(
      normalizeKey(row, ["description", "merchant", "name", "memo", "payee"])
    );
    const amount = parseAmount(
      normalizeKey(row, ["amount", "debit", "charge", "withdrawal", "paid"])
    );
    const date = normalizeKey(row, ["date", "posted", "transaction"]);

    if (!amount || merchant === "UNKNOWN MERCHANT") {
      return groups;
    }

    if (!groups[merchant]) {
      groups[merchant] = [];
    }

    groups[merchant].push({ merchant, amount, date });
    return groups;
  }, {});

  return Object.values(grouped)
    .filter((charges) => charges.length >= 2)
    .map((charges) => {
      const sorted = [...charges].sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
      );
      const latest = sorted[0];
      const previous = sorted.find((charge) => charge.amount !== latest.amount) || sorted[1];
      const increase = Math.max(0, latest.amount - previous.amount);
      const percentIncrease = previous.amount
        ? (increase / previous.amount) * 100
        : 0;

      return {
        merchant: latest.merchant,
        count: charges.length,
        latestAmount: latest.amount,
        previousAmount: previous.amount,
        increase,
        percentIncrease,
        yearlyCost: latest.amount * 12,
      };
    })
    .sort((a, b) => b.yearlyCost - a.yearlyCost);
}

export default function CreepCheckLandingPage() {
  const scannerRef = useRef(null);
  const reportRef = useRef(null);
  const fileInputRef = useRef(null);
  const [report, setReport] = useState(detectRecurringCharges(sampleTransactions));
  const [fileName, setFileName] = useState("Sample report");
  const [uploadStatus, setUploadStatus] = useState("Try the sample report or upload a CSV export.");
  const [email, setEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState("");

  const totals = useMemo(() => {
    const monthlySpend = report.reduce((sum, item) => sum + item.latestAmount, 0);
    const monthlyIncrease = report.reduce((sum, item) => sum + item.increase, 0);
    const biggestIncrease = report.reduce(
      (largest, item) => (item.increase > largest.increase ? item : largest),
      { merchant: "None yet", increase: 0, percentIncrease: 0 }
    );

    return {
      monthlySpend,
      monthlyIncrease,
      yearlySpend: monthlySpend * 12,
      biggestIncrease,
    };
  }, [report]);

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setUploadStatus("Scanning your CSV...");

    try {
      const Papa = (await import("papaparse")).default;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const detected = detectRecurringCharges(results.data);
          setReport(detected);
          setUploadStatus(
            detected.length
              ? `Found ${detected.length} recurring charges in ${file.name}.`
              : "No recurring charges found yet. Try a CSV with date, description, and amount columns."
          );
          reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        error: () => {
          setUploadStatus("That CSV could not be read. Try exporting it again from your bank.");
        },
      });
    } catch {
      setUploadStatus("The scanner could not start. Please try again.");
    }
  }

  function showSampleReport() {
    setReport(detectRecurringCharges(sampleTransactions));
    setFileName("Sample report");
    setUploadStatus("Loaded the sample CreepCheck report.");
    reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function saveLead(event) {
    event.preventDefault();

    if (!email.includes("@")) {
      setLeadStatus("Enter an email so we can save your early access spot.");
      return;
    }

    const leads = JSON.parse(localStorage.getItem("creepcheck-leads") || "[]");
    localStorage.setItem(
      "creepcheck-leads",
      JSON.stringify([...leads, { email, createdAt: new Date().toISOString() }])
    );
    setEmail("");
    setLeadStatus("You are on the early access list. Next step: paid reports.");
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white/95 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-sm">
              C
            </div>
            <span className="text-xl font-semibold tracking-tight">
              CreepCheck
            </span>
          </div>

          <button
            onClick={() => scannerRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="bg-slate-950 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition"
          >
            Try Free
          </button>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 py-20 lg:py-24 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm text-slate-700 mb-6">
              Detect silent subscription price increases
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
              Find the subscriptions quietly costing you money.
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
              Upload a bank or credit card CSV and instantly uncover recurring charges,
              forgotten subscriptions, and sneaky price increases.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-950 text-white px-6 py-4 rounded-2xl text-base font-medium hover:bg-slate-800 transition shadow-sm"
              >
                Upload Statement
              </button>

              <button
                onClick={showSampleReport}
                className="border border-slate-300 px-6 py-4 rounded-2xl text-base font-medium hover:bg-slate-50 transition"
              >
                View Sample Report
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <div>No bank login required</div>
              <div>CSV uploads only</div>
              <div>Built for quick decisions</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-500">Monthly subscription spend</p>
                <h2 className="text-4xl font-bold mt-1">{currency(totals.monthlySpend)}</h2>
              </div>

              <div className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-sm font-medium">
                {currency(totals.monthlyIncrease)} creep
              </div>
            </div>

            <div className="space-y-4">
              {featuredCharges.map((item) => (
                <div
                  key={item.name}
                  className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500 mt-1">{item.change}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{item.price}</p>
                    <p className="text-xs text-slate-400">monthly</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="scanner"
          ref={scannerRef}
          className="border-y border-slate-200 bg-slate-50"
        >
          <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                Free scanner
              </p>
              <h2 className="text-4xl font-bold tracking-tight mb-5">
                Give people a useful result before asking them to pay.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                This MVP reads common CSV exports locally, finds repeated merchants,
                and turns the scan into a report you can sell around.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-950 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-800 transition"
                >
                  Choose CSV
                </button>
                <button
                  onClick={showSampleReport}
                  className="border border-slate-300 px-5 py-3 rounded-xl font-medium hover:bg-slate-50 transition"
                >
                  Load Sample
                </button>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Current scan</p>
                <p className="font-semibold mt-1">{fileName}</p>
                <p className="text-sm text-slate-600 mt-2">{uploadStatus}</p>
              </div>
            </div>
          </div>
        </section>

        <section ref={reportRef} className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                Report
              </p>
              <h2 className="text-4xl font-bold tracking-tight">
                Your subscription creep snapshot.
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="border border-slate-200 rounded-2xl p-4">
                <p className="text-slate-500">Monthly</p>
                <p className="text-2xl font-bold mt-1">{currency(totals.monthlySpend)}</p>
              </div>
              <div className="border border-slate-200 rounded-2xl p-4">
                <p className="text-slate-500">Yearly</p>
                <p className="text-2xl font-bold mt-1">{currency(totals.yearlySpend)}</p>
              </div>
              <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4 col-span-2 sm:col-span-1">
                <p className="text-amber-900">Monthly creep</p>
                <p className="text-2xl font-bold mt-1">{currency(totals.monthlyIncrease)}</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-3xl">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] bg-slate-950 text-white text-sm font-medium">
              <div className="p-4">Merchant</div>
              <div className="p-4">Latest</div>
              <div className="p-4">Increase</div>
              <div className="p-4">Annual</div>
            </div>

            {report.length ? (
              report.map((item) => (
                <div
                  key={item.merchant}
                  className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] border-t border-slate-200 text-sm"
                >
                  <div className="p-4 font-medium">{item.merchant}</div>
                  <div className="p-4">{currency(item.latestAmount)}</div>
                  <div className="p-4">
                    {item.increase > 0
                      ? `${currency(item.increase)} (${item.percentIncrease.toFixed(1)}%)`
                      : "No increase"}
                  </div>
                  <div className="p-4">{currency(item.yearlyCost)}</div>
                </div>
              ))
            ) : (
              <div className="p-6 text-slate-600">
                No recurring charges detected yet. Try a fuller CSV export or load the sample.
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-3 gap-8">
              {valueCards.map((item) => (
                <div key={item.title}>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
              How it works
            </p>
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              Simple, secure, and designed for busy people.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              No complicated setup. No budgeting dashboard. Just quick visibility
              into recurring charges and the next best action.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div
                key={item.step}
                className="border border-slate-200 rounded-3xl p-8"
              >
                <div className="text-sm font-semibold text-slate-400 mb-5">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 text-white">
          <div className="max-w-4xl mx-auto px-6 py-24 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Build the audience before building the bank integrations.
            </h2>

            <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto">
              Collect early users now. The first paid offer can be a low-cost
              subscription audit and cancellation checklist.
            </p>

            <form onSubmit={saveLead} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-2xl px-5 py-4 text-slate-950 outline-none"
              />
              <button className="bg-white text-slate-950 px-7 py-4 rounded-2xl text-base font-semibold hover:bg-slate-100 transition">
                Join Early Access
              </button>
            </form>

            {leadStatus && (
              <p className="text-sm text-slate-300 mt-4">{leadStatus}</p>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div>Copyright 2026 CreepCheck</div>

          <div className="flex items-center gap-6">
            <a href="#scanner" className="hover:text-slate-900 transition">
              Privacy-first MVP
            </a>
            <a href="mailto:hello@creepcheck.com" className="hover:text-slate-900 transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
