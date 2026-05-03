import crypto from "crypto";
import { ApiKey } from "../models/ApiKey.js";
import { UsageLog } from "../models/UsageLog.js";
import { serializeApiKey } from "../utils/api-serializers.js";

export const createApiKey = async (req, res) => {
  try {
    const { apiId } = req.body;
    
    if (!apiId) {
      return res.status(400).json({ error: "apiId is required" });
    }

    const key = crypto.randomBytes(24).toString("hex");

    const newKey = await ApiKey.create({
      key,
      apiId,
      status: "ACTIVE"
    });

    res.status(201).json(serializeApiKey({ ...newKey.toObject(), id: newKey._id.toString() }, { includeSecret: true }));
  } catch (err) {
    console.error("Failed to create key:", err);
    res.status(500).json({ error: "Failed to create key" });
  }
};

export const getKeys = async (req, res) => {
  try {
    const apiId = req.query.apiId || req.params.apiId;
    
    if (!apiId) {
      return res.status(400).json({ error: "apiId is required" });
    }

    const keys = await ApiKey.find({ apiId })
      .populate('apiId', 'name')
      .sort({ createdAt: -1 })
      .lean();
    
    const keysWithUsage = await Promise.all(
      keys.map(async (k) => {
        const usageCount = await UsageLog.countDocuments({ apiKeyId: k._id });
        const lastLog = await UsageLog.findOne({ apiKeyId: k._id }).sort({ timestamp: -1 });
        
        return serializeApiKey({
          ...k,
          id: k._id.toString(),
          api: k.apiId, // Map populated apiId to 'api' for the serializer
          _count: { usageLogs: usageCount },
          usageLogs: lastLog ? [lastLog] : []
        }, { includeSecret: true });
      })
    );

    res.json(keysWithUsage);
  } catch (err) {
    console.error("Failed to fetch keys:", err);
    res.status(500).json({ error: "Failed to fetch keys" });
  }
};
