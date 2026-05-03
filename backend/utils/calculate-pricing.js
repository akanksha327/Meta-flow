const FREE_TIER_REQUESTS = 1000;
const PRICE_PER_100_REQUESTS = 0.5;

export function calculatePricing(totalRequests) {
  const billableRequests = Math.max(0, totalRequests - FREE_TIER_REQUESTS);
  const amount = Math.ceil(billableRequests / 100) * 50;

  return {
    totalRequests,
    billableRequests,
    amount,
    currency: "INR",
    freeTierRequests: FREE_TIER_REQUESTS,
    pricePer100Requests: 50,
  };
}

