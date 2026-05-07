type AdminLoginInput = {
  password: string;
};

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getMessage(body: unknown): string {
  if (typeof body === "object" && body !== null && "message" in body) {
    const message = body.message;

    if (typeof message === "string") {
      return message;
    }
  }

  return "Admin login failed";
}

export async function adminLoginRequest(input: AdminLoginInput): Promise<void> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await readJson(response);

  if (!response.ok) {
    throw new Error(getMessage(body));
  }
}
