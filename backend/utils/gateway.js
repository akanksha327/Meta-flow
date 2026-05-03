const requestHeadersToStrip = new Set([
  "accept-encoding",
  "connection",
  "content-length",
  "host",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "x-api-key",
]);

const responseHeadersToStrip = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export function normalizeProxyPath(proxyPath) {
  if (!proxyPath) {
    return [];
  }

  if (Array.isArray(proxyPath)) {
    return proxyPath.filter(Boolean);
  }

  return String(proxyPath)
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function buildEndpointPath(proxyPath) {
  const normalizedPath = normalizeProxyPath(proxyPath);

  if (!normalizedPath.length) {
    return "/";
  }

  return `/${normalizedPath.join("/")}`;
}

export function buildTargetUrl(baseUrl, proxyPath, queryParams = {}) {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const endpointPath = normalizeProxyPath(proxyPath).join("/");
  const targetUrl = new URL(endpointPath, normalizedBaseUrl);

  for (const [key, value] of Object.entries(queryParams)) {
    appendQueryValue(targetUrl, key, value);
  }

  return targetUrl.toString();
}

function appendQueryValue(targetUrl, key, value) {
  if (Array.isArray(value)) {
    value.forEach((item) => appendQueryValue(targetUrl, key, item));
    return;
  }

  if (value === undefined || value === null) {
    return;
  }

  targetUrl.searchParams.append(
    key,
    typeof value === "object" ? JSON.stringify(value) : String(value),
  );
}

export function buildForwardHeaders(headers, req) {
  const forwardHeaders = {};

  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (!headerValue || requestHeadersToStrip.has(headerName.toLowerCase())) {
      continue;
    }

    forwardHeaders[headerName] = headerValue;
  }

  forwardHeaders["x-forwarded-for"] = req.ip;
  forwardHeaders["x-forwarded-host"] = req.get("host");
  forwardHeaders["x-forwarded-proto"] = req.protocol;

  return forwardHeaders;
}

export function sanitizeProxyResponseHeaders(headers = {}) {
  const sanitizedHeaders = {};

  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (!headerValue || responseHeadersToStrip.has(headerName.toLowerCase())) {
      continue;
    }

    sanitizedHeaders[headerName] = headerValue;
  }

  return sanitizedHeaders;
}
