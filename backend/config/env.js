import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });

function parseNumber(value, fallback, variableName) {
  const resolvedValue = value ?? fallback;
  const parsedValue = Number(resolvedValue);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`${variableName} must be a valid number.`);
  }

  return parsedValue;
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is required.");
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseNumber(process.env.PORT, 5000, "PORT"),
  MONGO_URI: process.env.MONGO_URI,
  PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL ?? process.env.DATABASE_URL,
  REQUEST_BODY_LIMIT: process.env.REQUEST_BODY_LIMIT ?? "1mb",
  GATEWAY_BODY_LIMIT: process.env.GATEWAY_BODY_LIMIT ?? "10mb",
  GATEWAY_TIMEOUT_MS: parseNumber(process.env.GATEWAY_TIMEOUT_MS, 30000, "GATEWAY_TIMEOUT_MS"),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ?? null,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ?? null,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : null,
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? null,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? null,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ?? null,
};
