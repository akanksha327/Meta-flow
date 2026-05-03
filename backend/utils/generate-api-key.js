import { randomBytes } from "node:crypto";

export function generateApiKey() {
  return `mf_${randomBytes(16).toString("hex")}`;
}

export function getApiKeyPrefix(apiKey) {
  return apiKey.slice(0, 12);
}

