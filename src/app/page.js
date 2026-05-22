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

const trustCards = [
  {
    title: "No bank login",
    text: "Upload a CSV export instead of connecting your financial accounts.",
  },
  {
    title: "Private scan",
    text: "Your file is checked on your device for this preview and is not stored in an account.",
  },
  {
    title: "Clear next steps",
    text: "See which subscriptions changed, what they cost each year, and what to review first.",
  },
];

const valueCards = [
  {
    title: "Catch quiet price hikes",
    text: "Spot subscriptions that went up a few dollars at a time before those increases become normal.",
  },
  {
    title: "See the annual damage",
    text: "Turn small monthly charges into yearly totals so it is easier to decide what is worth keeping.",
  },
  {
    title: "Cancel with confidence",
    text: "Use the report to prioritize duplicate, unused, or overpriced services instead of guessing.",
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

const auditIncludes = [
  "Full subscription review from your scan",
  "Top cancellation and downgrade targets",
  "Price creep summary with annualized impact",
  "Simple checklist you can work through in one sitting",
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

function getReviewScore(item) {
  const priceCreepScore = item.increase * 12;
  const yearlySpendScore = item.yearlyCost * 0.15;

  return priceCreepScore + yearlySpendScore;
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
  const checklistRef = useRef(null);
  const fileInputRef = useRef(null);
  const [report, setReport] = useState(detectRecurringCharges(sampleTransactions));
  const [fileName, setFileName] = useState("Sample report");
  const [uploadStatus, setUploadStatus] = useState("Try the sample report or upload a CSV export from your bank.");
  const [email, setEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [isSavingLead, setIsSavingLead] = useState(false);
  const fullAuditUrl = process.env.NEXT_PUBLIC_FULL_AUDIT_URL || "";

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
      yearlyCreep: monthlyIncrease * 12,
      biggestIncrease,
    };
  }, [report]);

  const savingsPlan = useMemo(() => {
    const risingCharges = report.filter((item) => item.increase > 0);
    const highCostCharges = report.filter((item) => item.yearlyCost >= 250);
    const reviewFirst = [...report]
      .sort((a, b) => getReviewScore(b) - getReviewScore(a))
      .slice(0, 3);
    const possibleAnnualSavings = reviewFirst.reduce(
      (sum, item) => sum + item.latestAmount * 3 + item.increase * 12,
      0
    );

    return {
      risingCharges,
      highCostCharges,
      reviewFirst,
      possibleAnnualSavings,
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

  function openFullAudit() {
    if (fullAuditUrl) {
      window.location.href = fullAuditUrl;
      return;
    }

    setLeadStatus("Leave your email and we will send you the Full Audit link when it opens.");
    checklistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveLead(event) {
    event.preventDefault();

    if (!email.includes("@")) {
      setLeadStatus("Enter an email so we can send your subscription-saving checklist.");
      return;
    }

    setIsSavingLead(true);
    setLeadStatus("Saving your spot...");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "checklist",
          scan: {
            fileName,
            recurringCharges: report.length,
            monthlySpend: totals.monthlySpend,
            yearlySpend: totals.yearlySpend,
            yearlyCreep: totals.yearlyCreep,
            reviewFirst: savingsPlan.reviewFirst.map((item) => ({
              merchant: item.merchant,
              latestAmount: item.latestAmount,
              yearlyCost: item.yearlyCost,
              increase: item.increase,
            })),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Lead capture is not ready yet.");
      }

      setEmail("");
      setLeadStatus("You are on the list. We will send the subscription-saving checklist soon.");
    } catch (error) {
      setLeadStatus(
        error.message ||
          "We could not save your email yet. Please try again in a minute."
      );
    } finally {
      setIsSavingLead(false);
    }
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

      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-slate-700">
          <span className="font-medium text-slate-950">No bank login required</span>
          <span>Your CSV is checked on your device</span>
          <span>Clear subscription costs before you cancel</span>
        </div>
      </div>

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

            <div className="grid sm:grid-cols-3 gap-3 text-sm text-slate-600">
              {trustCards.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 leading-relaxed">{item.text}</p>
                </div>
              ))}
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
                Free scan
              </p>
              <h2 className="text-4xl font-bold tracking-tight mb-5">
                Check your statement for subscription creep in under a minute.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Upload a CSV export to find repeated charges, price increases,
                and yearly costs that are easy to miss month by month.
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

          <div className="mt-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <p className="text-sm font-medium text-amber-900 uppercase tracking-wider mb-3">
                Savings plan
              </p>
              <h3 className="text-3xl font-bold tracking-tight mb-3">
                Start with the charges most likely to save you money.
              </h3>
              <p className="text-slate-700 leading-relaxed mb-5">
                Your scan shows {currency(totals.yearlyCreep)} in yearly price creep
                and {savingsPlan.highCostCharges.length} subscriptions above{" "}
                {currency(250)} per year.
              </p>
              <button
                onClick={() => checklistRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="bg-slate-950 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-800 transition"
              >
                Get My Checklist
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-sm text-slate-500">Review first</p>
                  <h3 className="text-2xl font-bold tracking-tight">
                    Potential review opportunity: {currency(savingsPlan.possibleAnnualSavings)}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Based on three months of top charges plus yearly price creep.
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  {savingsPlan.risingCharges.length} price hikes found
                </div>
              </div>

              <div className="space-y-3">
                {savingsPlan.reviewFirst.length ? (
                  savingsPlan.reviewFirst.map((item) => (
                    <div
                      key={item.merchant}
                      className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold">{item.merchant}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {item.increase > 0
                            ? `${currency(item.increase)} monthly increase`
                            : `${currency(item.yearlyCost)} per year`}
                        </p>
                      </div>
                      <div className="text-right text-sm text-slate-600">
                        <p className="font-semibold text-slate-950">Review</p>
                        <p>Keep, downgrade, or cancel</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">
                    Upload a fuller CSV to generate a prioritized savings plan.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-950 p-6 sm:p-8 text-white">
            <div className="grid lg:grid-cols-[1fr_0.75fr] gap-8 items-center">
              <div>
                <p className="text-sm font-medium text-amber-200 uppercase tracking-wider mb-4">
                  Full Audit
                </p>
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Want the complete cancellation plan?
                </h3>
                <p className="text-slate-300 leading-relaxed mb-6 max-w-2xl">
                  Get a focused CreepCheck audit that turns your scan into a
                  practical subscription cleanup plan, so you know what to keep,
                  downgrade, cancel, or watch next month.
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {auditIncludes.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-5 text-slate-950">
                <p className="text-sm text-slate-500 mb-2">One-time audit</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-5xl font-bold">$5</span>
                  <span className="text-slate-500 pb-2">intro price</span>
                </div>
                <p className="text-slate-600 leading-relaxed mb-5">
                  Best for people who want a quick second look before canceling
                  or downgrading subscriptions.
                </p>
                <button
                  onClick={openFullAudit}
                  className="w-full bg-slate-950 text-white px-5 py-4 rounded-2xl font-semibold hover:bg-slate-800 transition"
                >
                  {fullAuditUrl ? "Get The Full Audit" : "Reserve My Audit"}
                </button>
                <p className="text-xs text-slate-500 mt-4">
                  No bank login required. You stay in control of what you share.
                </p>
              </div>
            </div>
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

        <section ref={checklistRef} className="bg-slate-950 text-white">
          <div className="max-w-4xl mx-auto px-6 py-24 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Stop paying for subscriptions you would cancel if you noticed them sooner.
            </h2>

            <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto">
              Join the list for a simple subscription-saving checklist based on
              the same review order shown in your scan.
            </p>

            <form
              onSubmit={saveLead}
              className="max-w-2xl mx-auto rounded-3xl bg-white p-4 sm:p-5 text-left shadow-sm"
            >
              <label
                htmlFor="checklist-email"
                className="block text-sm font-semibold text-slate-950 mb-2"
              >
                Email the checklist to me
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="checklist-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-2xl border-2 border-slate-300 bg-slate-50 px-5 py-4 text-slate-950 placeholder:text-slate-500 outline-none focus:border-amber-400 focus:bg-white"
                />
                <button
                  disabled={isSavingLead}
                  className="bg-slate-950 text-white px-7 py-4 rounded-2xl text-base font-semibold hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingLead ? "Saving..." : "Send Me The Checklist"}
                </button>
              </div>
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
              Privacy-first scan
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
