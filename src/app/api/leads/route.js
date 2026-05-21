function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "Please submit a valid email address." },
      { status: 400 }
    );
  }

  const email = String(body.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return Response.json(
      { message: "Please submit a valid email address." },
      { status: 400 }
    );
  }

  if (!process.env.LEADS_WEBHOOK_URL) {
    return Response.json(
      {
        message:
          "Email capture is almost ready. Add LEADS_WEBHOOK_URL in Vercel to collect checklist requests.",
      },
      { status: 503 }
    );
  }

  const lead = {
    email,
    source: body.source || "checklist",
    scan: body.scan || {},
    submittedAt: new Date().toISOString(),
  };

  const response = await fetch(process.env.LEADS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    return Response.json(
      { message: "We could not save your email yet. Please try again." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
