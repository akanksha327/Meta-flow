import { getApiKeyPrefix } from "./generate-api-key.js";

export function serializeApi(apiRecord) {
  return {
    id: apiRecord.id,
    name: apiRecord.name,
    baseUrl: apiRecord.baseUrl,
    createdAt: apiRecord.createdAt,
    keyCount: apiRecord.keyCount ?? 0,
  };
}

export function serializeApiKey(apiKeyRecord, options = {}) {
  const { includeSecret = false } = options;
  const prefix = getApiKeyPrefix(apiKeyRecord.key);
  const lastUsedAt = apiKeyRecord.usageLogs?.[0]?.timestamp ?? null;

  const serialized = {
    id: apiKeyRecord.id,
    apiId: apiKeyRecord.apiId,
    apiName: apiKeyRecord.api?.name ?? null,
    name: `${apiKeyRecord.api?.name ?? "MeterFlow"} Key ${prefix}`,
    prefix,
    status: apiKeyRecord.status.toLowerCase(),
    createdAt: apiKeyRecord.createdAt,
    lastUsedAt,
    usageCount: apiKeyRecord._count?.usageLogs ?? undefined,
  };

  if (includeSecret) {
    serialized.key = apiKeyRecord.key;
  }

  return serialized;
}
