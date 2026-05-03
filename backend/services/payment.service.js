import crypto from "crypto";
import { env } from "../config/env.js";
import { User, Payment } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { razorpay } from "./razorpay.service.js";
import { getBillingForUser } from "./billing.service.js";

export async function createOrderForUser({ userId, amount }) {
  const billing = await getBillingForUser(userId);
  // Force ₹499 for testing if no balance is due
  const requestedAmount = amount || (billing.amountDue > 0 ? billing.amountDue : 499);

  const options = {
    amount: Math.round(requestedAmount * 100), // Amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: {
      userId,
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log("Razorpay Order Created successfully:", order.id, "for amount:", order.amount);

    await Payment.create({
      userId,
      amount: requestedAmount,
      currency: "INR",
      status: "PENDING",
      razorpayOrderId: order.id,
    });

    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error("Razorpay Error Details:", error);
    throw new AppError("Failed to create payment order.", 500);
  }
}

export async function verifyPaymentForUser({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new AppError("Invalid payment signature.", 400);
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      status: "PAID",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      completedAt: new Date(),
    },
    { new: true }
  );

  if (!payment) {
    throw new AppError("Payment record not found.", 404);
  }

  await User.findByIdAndUpdate(payment.userId, { billingStatus: "ACTIVE" });

  return { success: true, paymentId: payment._id };
}
