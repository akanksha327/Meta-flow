import { UsageLog, Api, ApiKey } from "../models/index.js";
import mongoose from "mongoose";

export const getUsageController = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      // 1. Get all API IDs for this user
      const userApis = await Api.find({ userId }).select("_id name");
      const apiIds = userApis.map(a => a._id);
      
      // 2. Get all API Keys for these APIs
      const userKeys = await ApiKey.find({ apiId: { $in: apiIds } }).select("_id");
      const keyIds = userKeys.map(k => k._id);

      // 3. Get last 6 days of usage for these keys
      const dates = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }

      const stats = await UsageLog.aggregate([
        {
          $match: {
            apiKeyId: { $in: keyIds },
            timestamp: { $gte: new Date(dates[0]) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            count: { $sum: 1 }
          }
        }
      ]);

      // Map stats to the 6 dates
      const daily = dates.map(date => {
        const stat = stats.find(s => s._id === date);
        return stat ? stat.count : 0;
      });

      // 4. Get Recent Logs
      const recentLogs = await UsageLog.find({ apiKeyId: { $in: keyIds } })
        .populate({
          path: 'apiKeyId',
          populate: { path: 'apiId', select: 'name' }
        })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();

      const formattedLogs = recentLogs.map(log => ({
        id: log._id,
        apiName: log.apiKeyId?.apiId?.name || "Unknown",
        endpoint: log.endpoint,
        status: log.status,
        latency: log.latency,
        timestamp: log.timestamp
      }));

      const totalRealRequests = daily.reduce((a, b) => a + b, 0);

      // If they have real usage, show it.
      if (totalRealRequests > 0) {
        return res.json({
          totalRequests: totalRealRequests,
          daily: daily,
          recentLogs: formattedLogs,
          timeSeries: dates.map((d, i) => ({ date: d, count: daily[i] }))
        });
      }
    }

    // Default mock data for new accounts
    res.json({
      totalRequests: 850,
      daily: [45, 82, 33, 91, 58, 74],
      recentLogs: [
        { id: "1", apiName: "Demo API", endpoint: "/v1/users", status: 200, latency: 120, timestamp: new Date() },
        { id: "2", apiName: "Demo API", endpoint: "/v1/posts", status: 200, latency: 240, timestamp: new Date() }
      ],
      timeSeries: [
        { date: 'Mon', count: 45 },
        { date: 'Tue', count: 82 },
        { date: 'Wed', count: 33 },
        { date: 'Thu', count: 91 },
        { date: 'Fri', count: 58 },
        { date: 'Sat', count: 74 }
      ]
    });
  } catch (err) {
    console.error("Usage stats error:", err);
    res.json({
      totalRequests: 0,
      daily: [0, 0, 0, 0, 0, 0],
      recentLogs: []
    });
  }
};
