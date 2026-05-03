import axios from "axios";
import { env } from "../config/env.js";
import { ApiKey, UsageLog } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { calculateLatency, startTimer } from "../utils/calculate-latency.js";
import {
  buildEndpointPath,
  buildForwardHeaders,
  buildTargetUrl,
  sanitizeProxyResponseHeaders,
} from "../utils/gateway.js";

function maskApiKey(apiKeyValue) {
  if (!apiKeyValue) {
    return null;
  }

  if (apiKeyValue.length <= 8) {
    return "***";
  }

  return `${apiKeyValue.slice(0, 4)}...${apiKeyValue.slice(-4)}`;
}

async function logUsage(apiKeyId, endpoint, status, latency) {
  try {
    await UsageLog.create({
      apiKeyId,
      endpoint,
      status,
      latency,
    });
  } catch (error) {
    console.error("Failed to log usage:", error.message);
  }
}

export async function proxyGatewayRequest({ apiId, proxyPath, req }) {
  const apiKeyValue = req.get("x-api-key")?.trim();

  if (!apiKeyValue) {
    throw new AppError("x-api-key header is required.", 401);
  }

  const apiKeyRecord = await ApiKey.findOne({
    key: apiKeyValue,
    status: "ACTIVE",
  }).populate("apiId");

  if (!apiKeyRecord) {
    throw new AppError("Invalid or revoked API key.", 403);
  }

  if (apiKeyRecord.apiId?._id.toString() !== apiId) {
    throw new AppError("Key not valid for this API", 403);
  }

  const baseUrl = apiKeyRecord.apiId?.baseUrl;

  if (!baseUrl) {
    throw new AppError("The selected API does not have a baseUrl configured.", 500);
  }

  const endpoint = buildEndpointPath(proxyPath);
  const targetUrl = buildTargetUrl(baseUrl, proxyPath, req.query);
  const startedAt = startTimer();

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: buildForwardHeaders(req.headers, req),
      data: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
      timeout: env.GATEWAY_TIMEOUT_MS,
      validateStatus: () => true,
      responseType: "arraybuffer",
      decompress: false,
    });

    const latency = calculateLatency(startedAt);

    await logUsage(apiKeyRecord._id, endpoint, response.status, latency);

    return {
      statusCode: response.status,
      headers: sanitizeProxyResponseHeaders(response.headers),
      body: response.data,
    };
  } catch (error) {
    const statusCode = error.code === "ECONNABORTED" ? 504 : 502;
    const latency = calculateLatency(startedAt);

    await logUsage(apiKeyRecord._id, endpoint, statusCode, latency);

    throw new AppError("Failed to forward request to the upstream API.", statusCode, {
      targetUrl,
      cause: error.message,
    });
  }
}
