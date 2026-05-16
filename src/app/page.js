// CreepCheck MVP Build Guide
//
// 1. Create app:
// npx create-next-app@latest creepcheck
//
// 2. Install dependencies:
// npm install @supabase/supabase-js papaparse openai react-dropzone lucide-react
//
// 3. Install Tailwind if needed:
// https://tailwindcss.com/docs/guides/nextjs
//
// 4. Create environment variables:
// .env.local
// NEXT_PUBLIC_SUPABASE_URL=your_url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
// OPENAI_API_KEY=your_key
//
// 5. Recommended folder structure:
// /app
// /components
// /lib
// /api
// /utils
//
// 6. Recommended first build order:
// - Landing page
// - CSV uploader
// - Transaction parser
// - Recurring charge detector
// - Dashboard results page
// - AI insights
// - Email capture
//
// 7. Deploy:
// Push to GitHub
// Connect repo to Vercel
// Add environment variables in Vercel
// Deploy
//
// 8. First MVP Goal:
// Validate that users upload CSVs and understand the value.

export default function CreepCheckLandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              C
            </div>
            <span className="text-xl font-semibold tracking-tight">
              CreepCheck
            </span>
          </div>

          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition">
            Try Free
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm text-slate-700 mb-6">
            Detect silent subscription price increases
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            Find the subscriptions quietly costing you money.
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
            Upload a bank or credit card CSV and instantly uncover recurring charges,
            duplicate subscriptions, forgotten trials, and sneaky price increases.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-base font-medium hover:opacity-90 transition shadow-sm">
              Upload Statement
            </button>

            <button className="border border-slate-300 px-6 py-4 rounded-2xl text-base font-medium hover:bg-slate-50 transition">
              View Sample Report
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
            <div>✓ No bank login required</div>
            <div>✓ CSV uploads only</div>
            <div>✓ Auto-delete available</div>
          </div>
        </div>

        {/* Dashboard Mock */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-500">Monthly subscription spend</p>
              <h2 className="text-4xl font-bold mt-1">$184.92</h2>
            </div>

            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              +12% this year
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                name: 'Netflix',
                price: '$22.99',
                change: '+$4 increase',
              },
              {
                name: 'Spotify Family',
                price: '$18.99',
                change: '+$2 increase',
              },
              {
                name: 'Adobe Creative Cloud',
                price: '$78.99',
                change: 'Unused 47 days',
              },
              {
                name: 'Apple Storage',
                price: '$3.99',
                change: 'Duplicate cloud storage',
              },
            ].map((item) => (
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

      {/* Trust Section */}
      <section className="border-t border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Private by default</h3>
              <p className="text-slate-600 leading-relaxed">
                We never ask for your banking credentials. Upload CSV exports directly
                from your bank or credit card provider.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Built for clarity</h3>
              <p className="text-slate-600 leading-relaxed">
                CreepCheck focuses only on recurring charges and silent price increases —
                not budgeting or financial tracking.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Fast insights</h3>
              <p className="text-slate-600 leading-relaxed">
                Upload your statement and receive a clean breakdown of your recurring
                expenses in under a minute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
            How it works
          </p>

          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Simple, secure, and designed for busy people.
          </h2>

          <p className="text-lg text-slate-600 leading-relaxed">
            No complicated setup. No spreadsheets. No financial planning dashboards.
            Just quick visibility into the recurring charges draining your wallet.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Export your CSV',
              text: 'Download your bank or credit card transactions directly from your provider.',
            },
            {
              step: '02',
              title: 'Upload securely',
              text: 'We scan recurring charges, subscription patterns, and price increases.',
            },
            {
              step: '03',
              title: 'See the leaks',
              text: 'Review hidden costs, annual totals, duplicate services, and suspicious increases.',
            },
          ].map((item) => (
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

      {/* CTA */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Stop letting subscriptions quietly grow.
          </h2>

          <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto">
            Upload a statement and uncover the recurring charges, price increases,
            and forgotten subscriptions costing you money every month.
          </p>

          <button className="bg-white text-slate-900 px-7 py-4 rounded-2xl text-base font-semibold hover:opacity-90 transition">
            Try CreepCheck Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div>© 2026 CreepCheck</div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-900 transition">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-900 transition">
              Terms
            </a>
            <a href="#" className="hover:text-slate-900 transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
    );
}

// ========================================
// SAMPLE CSV PARSER UTILITY
// /utils/parseTransactions.js
// ========================================

export async function parseCSV(file) {
  const Papa = (await import('papaparse')).default;

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

// ========================================
// SAMPLE RECURRING DETECTION LOGIC
// /utils/detectRecurring.js
// ========================================

export function detectRecurringCharges(transactions) {
  const grouped = {};

  transactions.forEach((txn) => {
    const merchant = txn.Description || txn.description || 'Unknown';

    if (!grouped[merchant]) {
      grouped[merchant] = [];
    }

    grouped[merchant].push(txn);
  });

  const recurring = [];

  Object.entries(grouped).forEach(([merchant, txns]) => {
    if (txns.length >= 2) {
      recurring.push({
        merchant,
        count: txns.length,
        latestAmount: txns[0].Amount || txns[0].amount,
      });
    }
  });

  return recurring;
}

// ========================================
// SAMPLE OPENAI PROMPT
// /api/analyze.js
// ========================================

const prompt = `
Analyze these financial transactions.

Identify:
1. Recurring subscriptions
2. Possible duplicate services
3. Price increases
4. Forgotten subscriptions
5. High annual recurring costs

Return concise insights.
`;

// ========================================
// MVP DATABASE TABLES (SUPABASE)
// ========================================

// users
// uploads
// transactions
// recurring_charges
// reports

// Example uploads schema:
// id
// user_id
// filename
// uploaded_at

// Example recurring_charges schema:
// id
// user_id
// merchant
// monthly_amount
// yearly_amount
// detected_price_change
// created_at