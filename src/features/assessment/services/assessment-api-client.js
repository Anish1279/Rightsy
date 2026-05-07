"use client";

export async function fetchAssessmentProgress() {
  const response = await fetch("/api/assessments/progress", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load assessment progress");
  }

  return response.json();
}

export async function submitAssessmentAttempt(payload) {
  const response = await fetch("/api/assessments/attempts", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.error?.message || body?.message || "Unable to submit assessment";
    throw new Error(message);
  }

  return body;
}
