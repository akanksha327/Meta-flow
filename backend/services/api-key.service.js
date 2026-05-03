import { Api, ApiKey, UsageLog } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { serializeApiKey } from "../utils/api-serializers.js";
import { generateApiKey } from "../utils/generate-api-key.js";

async function findOwnedApi(userId, apiId) {
  const apiRecord = await Api.findOne({
    _id: apiId,
    userId,
  });

  if (!apiRecord) {
    throw new AppError("API not found for the authenticated user.", 404);
  }

  return apiRecord;
}

async function resolveApiId(userId, apiId) {
  if (apiId) {
    await findOwnedApi(userId, apiId);
    return apiId;
  }

  const apiRecords = await Api.find({ userId })
    .select("_id")
    .sort({ createdAt: -1 })
    .limit(2);

  if (apiRecords.length !== 1) {
    throw new AppError("apiId is required to create an API key.", 400);
  }

  return apiRecords[0]._id;
}

async function createUniqueApiKeyRecord(apiId) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const key = generateApiKey();

    try {
      const apiKeyRecord = await ApiKey.create({
        apiId,
        key,
      });

      // Fetch with relations for serialization
      const fullRecord = await ApiKey.findById(apiKeyRecord._id)
        .populate("api")
        .lean();
      
      const usageLogs = await UsageLog.find({ apiKeyId: fullRecord._id })
        .sort({ timestamp: -1 })
        .limit(1)
        .lean();
      
      const usageCount = await UsageLog.countDocuments({ apiKeyId: fullRecord._id });

      return {
        ...fullRecord,
        id: fullRecord._id.toString(),
        usageLogs,
        _count: { usageLogs: usageCount }
      };
    } catch (error) {
      if (error.code !== 11000 || attempt === 4) { // 11000 is Mongo duplicate key error
        throw error;
      }
    }
  }

  throw new AppError("Unable to generate a unique API key.", 500);
}

export async function createApiKeyForUser(userId, payload) {
  const apiId = await resolveApiId(userId, payload.apiId?.trim());
  const apiKeyRecord = await createUniqueApiKeyRecord(apiId);

  return serializeApiKey(apiKeyRecord, { includeSecret: true });
}

export async function listApiKeysForUser(userId, filters = {}) {
  const apiId = filters.apiId?.trim();

  const userApis = await Api.find({ userId }).select("_id");
  const userApiIds = userApis.map(a => a._id);

  const query = {
    apiId: { $in: userApiIds }
  };

  if (apiId) {
    query.apiId = apiId;
  }

  const apiKeyRecords = await ApiKey.find(query)
    .populate("api")
    .sort({ createdAt: -1 })
    .lean();

  const enrichedRecords = await Promise.all(
    apiKeyRecords.map(async (record) => {
      const usageLogs = await UsageLog.find({ apiKeyId: record._id })
        .sort({ timestamp: -1 })
        .limit(1)
        .lean();
      
      const usageCount = await UsageLog.countDocuments({ apiKeyId: record._id });

      return {
        ...record,
        id: record._id.toString(),
        usageLogs,
        _count: { usageLogs: usageCount }
      };
    })
  );

  return enrichedRecords.map((record) => serializeApiKey(record, { includeSecret: true }));
}

export async function revokeApiKeyForUser(userId, apiKeyId) {
  const userApis = await Api.find({ userId }).select("_id");
  const userApiIds = userApis.map(a => a._id);

  const existingApiKey = await ApiKey.findOne({
    _id: apiKeyId,
    apiId: { $in: userApiIds }
  }).populate("api").lean();

  if (!existingApiKey) {
    throw new AppError("API key not found for the authenticated user.", 404);
  }

  const updatedApiKey = await ApiKey.findByIdAndUpdate(
    apiKeyId,
    { status: "REVOKED" },
    { new: true }
  ).populate("api").lean();

  const usageLogs = await UsageLog.find({ apiKeyId: updatedApiKey._id })
    .sort({ timestamp: -1 })
    .limit(1)
    .lean();
  
  const usageCount = await UsageLog.countDocuments({ apiKeyId: updatedApiKey._id });

  const result = {
    ...updatedApiKey,
    id: updatedApiKey._id.toString(),
    usageLogs,
    _count: { usageLogs: usageCount }
  };

  return serializeApiKey(result);
}
