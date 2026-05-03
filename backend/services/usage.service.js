import { Api, ApiKey, UsageLog } from "../models/index.js";

async function buildUsageFilter(userId, filters = {}) {
  const apiId = filters.apiId?.trim();
  const apiKeyId = filters.apiKeyId?.trim();

  const userApis = await Api.find({ userId }).select("_id");
  const userApiIds = userApis.map(a => a._id);

  const userApiKeys = await ApiKey.find({ apiId: { $in: userApiIds } }).select("_id");
  const userApiKeyIds = userApiKeys.map(k => k._id);

  const query = {
    apiKeyId: { $in: userApiKeyIds }
  };

  if (apiKeyId) {
    query.apiKeyId = apiKeyId;
  }

  if (apiId) {
    const apiKeysForSpecificApi = await ApiKey.find({ apiId }).select("_id");
    const specificApiKeyIds = apiKeysForSpecificApi.map(k => k._id);
    query.apiKeyId = { $in: specificApiKeyIds.filter(id => userApiKeyIds.some(uid => uid.equals(id))) };
  }

  return query;
}

export async function getUsageForUser(userId, filters = {}) {
  if (userId === "dev-user-id") {
    return {
      logs: [],
      totalRequests: 0,
      avgLatency: 0,
      activeEndpoints: 0,
      errorRate: 0,
      timeSeries: [],
      topEndpoints: [],
    };
  }

  const query = await buildUsageFilter(userId, filters);
  const limit = Math.min(Number(filters.limit ?? 100) || 100, 500);

  const [logs, totalRequests, latencyStats, errorCount, activeEndpoints] = await Promise.all([
    UsageLog.find(query)
      .populate({
        path: "apiKeyId",
        populate: { path: "apiId" }
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean(),
    UsageLog.countDocuments(query),
    UsageLog.aggregate([
      { $match: query },
      { $group: { _id: null, avgLatency: { $avg: "$latency" } } }
    ]),
    UsageLog.countDocuments({ ...query, status: { $gte: 400 } }),
    UsageLog.distinct("endpoint", query)
  ]);

  const avgLatency = latencyStats.length > 0 ? Math.round(latencyStats[0].avgLatency) : 0;

  return {
    logs: logs.map((log) => ({
      id: log._id.toString(),
      apiId: log.apiKeyId?.apiId?._id?.toString(),
      apiName: log.apiKeyId?.apiId?.name || "Unknown",
      apiKeyId: log.apiKeyId?._id?.toString(),
      endpoint: log.endpoint,
      status: log.status,
      latency: log.latency,
      timestamp: log.timestamp,
    })),
    totalRequests,
    avgLatency,
    activeEndpoints: activeEndpoints.length,
    errorRate: totalRequests ? Number(((errorCount / totalRequests) * 100).toFixed(2)) : 0,
    timeSeries: await getUsageTimeSeries(query),
    topEndpoints: await getTopEndpoints(query),
  };
}

async function getUsageTimeSeries(query) {
  const logs = await UsageLog.find(query)
    .select("timestamp")
    .sort({ timestamp: 1 })
    .lean();

  const groups = {};
  logs.forEach((log) => {
    const date = new Date(log.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    groups[date] = (groups[date] || 0) + 1;
  });

  return Object.entries(groups).map(([date, count]) => ({
    date,
    count,
  }));
}

async function getTopEndpoints(query) {
  const stats = await UsageLog.aggregate([
    { $match: query },
    { $group: { _id: "$endpoint", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  const total = await UsageLog.countDocuments(query);
  
  return stats.map(stat => ({
    path: stat._id,
    reqs: stat.count,
    perc: total ? Math.round((stat.count / total) * 100) : 0
  }));
}

export async function countUsageForUser(userId) {
  if (userId === "dev-user-id") {
    return 0;
  }
  const query = await buildUsageFilter(userId);
  return UsageLog.countDocuments(query);
}
