import { Api, ApiKey } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { serializeApi } from "../utils/api-serializers.js";

function normalizeBaseUrl(baseUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new AppError("API baseUrl must be a valid URL.", 400);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new AppError("API baseUrl must start with http:// or https://.", 400);
  }

  parsedUrl.hash = "";
  parsedUrl.search = "";

  return parsedUrl.toString().replace(/\/$/, "");
}

export async function createApiForUser(userId, payload) {
  const name = payload.name?.trim();
  const baseUrl = payload.baseUrl?.trim();

  if (!name) {
    throw new AppError("API name is required.", 400);
  }

  if (!baseUrl) {
    throw new AppError("API baseUrl is required.", 400);
  }

  console.log("Creating API in DB for user:", userId);

  try {
    const apiRecord = await Api.create({
      name,
      baseUrl: normalizeBaseUrl(baseUrl),
      userId: new mongoose.Types.ObjectId(userId),
    });

    console.log("API created in DB:", apiRecord._id);
    return serializeApi({ ...apiRecord.toObject(), id: apiRecord._id.toString(), keyCount: 0 });
  } catch (error) {
    console.error("Mongoose error in createApiForUser:", error);
    throw error;
  }
}

export async function listApisForUser(userId) {
  const apiRecords = await Api.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();

  const apisWithCounts = await Promise.all(
    apiRecords.map(async (api) => {
      const keyCount = await ApiKey.countDocuments({ apiId: api._id });
      return { 
        ...api, 
        id: api._id.toString(), 
        keyCount: keyCount 
      };
    })
  );

  return apisWithCounts.map(serializeApi);
}
