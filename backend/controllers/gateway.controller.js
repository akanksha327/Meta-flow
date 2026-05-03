import { proxyGatewayRequest } from "../services/gateway.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const gatewayController = asyncHandler(async (req, res) => {
  const proxiedResponse = await proxyGatewayRequest({
    apiId: req.params.apiId,
    proxyPath: req.params.proxyPath,
    req,
  });

  res.set(proxiedResponse.headers);
  res.status(proxiedResponse.statusCode).send(proxiedResponse.body);
});
