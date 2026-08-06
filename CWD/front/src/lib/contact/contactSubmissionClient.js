function trimEnvValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBaseUrl(value) {
  return trimEnvValue(value).replace(/\/+$/, "");
}

function buildContactSubmissionEndpoint(baseUrl) {
  return `${normalizeBaseUrl(baseUrl)}/api/v1/contact-submissions`;
}

function isPositiveResponseStatus(status) {
  return status === 200 || status === 201;
}

function isSuccessfulSubmissionBody(body) {
  return (
    body &&
    typeof body === "object" &&
    typeof body.submissionId === "string" &&
    body.submissionId.length > 0 &&
    body.status === "RECEIVED" &&
    typeof body.receivedAt === "string" &&
    body.receivedAt.length > 0
  );
}

async function readJsonBody(response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return null;
  }
}

function normalizeProblemResult(response, body) {
  return {
    ok: false,
    kind: "http",
    status: response.status,
    code:
      body && typeof body === "object" && typeof body.code === "string"
        ? body.code
        : null,
  };
}

export function getPublicContactApiBaseUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_CWD_API_BASE_URL);
}

export function getPublicTurnstileSiteKey() {
  return trimEnvValue(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export async function submitContactSubmission({
  payload,
  idempotencyKey,
  baseUrl = getPublicContactApiBaseUrl(),
}) {
  if (!baseUrl) {
    return {
      ok: false,
      kind: "configuration",
      reason: "missing_api_base_url",
    };
  }

  if (!idempotencyKey) {
    return {
      ok: false,
      kind: "configuration",
      reason: "missing_idempotency_key",
    };
  }

  const endpoint = buildContactSubmissionEndpoint(baseUrl);

  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, application/problem+json",
        "Idempotency-Key": idempotencyKey,
      },
      credentials: "omit",
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      ok: false,
      kind: "network",
    };
  }

  const body = await readJsonBody(response);

  if (isPositiveResponseStatus(response.status)) {
    if (!isSuccessfulSubmissionBody(body)) {
      return {
        ok: false,
        kind: "invalid_success",
        status: response.status,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: body,
    };
  }

  return normalizeProblemResult(response, body);
}
