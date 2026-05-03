import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { requestLogger } from "./middleware/request-logger.js";
import apiRoutes from "./routes/index.js";
import gatewayRoutes from "./routes/gateway.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import usageRoutes from "./routes/usage.routes.js";
import apiKeyRoutes from "./routes/apiKey.routes.js";
import testRoutes from "./routes/test.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(cors());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "MeterFlow backend is running.",
  });
});

app.get("/posts", (_req, res) => {
  res.status(200).json([
    { id: 1, title: "Post 1" },
    { id: 2, title: "Post 2" },
  ]);
});

app.use(
  "/gateway",
  express.raw({
    type: "*/*",
    limit: env.GATEWAY_BODY_LIMIT,
  }),
  gatewayRoutes,
);

app.use(
  express.json({
    limit: env.REQUEST_BODY_LIMIT,
  }),
);
app.use(
  express.urlencoded({
    extended: true,
    limit: env.REQUEST_BODY_LIMIT,
  }),
);

app.use("/api/payment", paymentRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/keys", apiKeyRoutes);

app.use("/test", testRoutes);
app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
