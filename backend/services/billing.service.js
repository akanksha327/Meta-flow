import mongoose from "mongoose";
import { User, Payment } from "../models/index.js";
import { calculatePricing } from "../utils/calculate-pricing.js";
import { countUsageForUser } from "./usage.service.js";

function getDaysLeftInMonth() {
  const currentDate = new Date();
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );

  return Math.max(0, lastDayOfMonth.getDate() - currentDate.getDate());
}

function getCurrentBillingCycleStart() {
  const currentDate = new Date();
  return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
}

function toCurrencyAmount(value) {
  return Number(Number(value ?? 0).toFixed(2));
}

export async function getBillingForUser(userId) {
  if (userId === "dev-user-id") {
    return {
      totalRequests: 0,
      billableRequests: 0,
      amount: 0,
      currency: "INR",
      freeTierRequests: 1000,
      pricePer100Requests: 50,
      estimatedTotal: 0,
      amountDue: 0,
      paidThisCycle: 0,
      daysLeft: getDaysLeftInMonth(),
      billingStatus: "ACTIVE",
      requests: {
        current: 0,
        limit: 1000,
      },
      storage: {
        current: 0,
        limit: 0,
      },
      latestPayment: null,
    };
  }

  const billingCycleStart = getCurrentBillingCycleStart();

  // Ensure userId is a valid ObjectId for the aggregation
  let userObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(userId);
  } catch (e) {
    console.error("Invalid userId for billing aggregation:", userId);
    userObjectId = null;
  }

  const [totalRequests, paidAggregate, latestPayment, user] = await Promise.all([
    countUsageForUser(userId),
    userObjectId ? Payment.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: "PAID",
          completedAt: { $gte: billingCycleStart }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]) : Promise.resolve([]),
    Payment.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    User.findById(userId).lean()
  ]);

  const pricing = calculatePricing(totalRequests);
  const paidThisCycle = paidAggregate.length > 0 ? toCurrencyAmount(paidAggregate[0].totalAmount) : 0;
  const amountDue = toCurrencyAmount(Math.max(pricing.amount - paidThisCycle, 0));

  return {
    ...pricing,
    estimatedTotal: pricing.amount,
    amountDue,
    paidThisCycle,
    daysLeft: getDaysLeftInMonth(),
    billingStatus: "ACTIVE",
    requests: {
      current: totalRequests,
      limit: pricing.freeTierRequests,
    },
    storage: {
      current: 0,
      limit: 0,
    },
    latestPayment: latestPayment
      ? {
          id: latestPayment._id.toString(),
          amount: toCurrencyAmount(latestPayment.amount),
          currency: latestPayment.currency,
          status: latestPayment.status,
          stripeSessionId: latestPayment.stripeSessionId,
          createdAt: latestPayment.createdAt,
          completedAt: latestPayment.completedAt,
        }
      : null,
  };
}
