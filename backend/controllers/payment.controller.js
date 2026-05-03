import crypto from "crypto";
import { razorpay } from "../services/razorpay.service.js";
import { Payment } from "../models/Payment.js";
import { env } from "../config/env.js";

export const createOrderController = async (req, res) => {
  try {
    const options = {
      amount: 49900, // ₹499
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay ERROR Details:", error);
    return res.status(500).json({
      error: "Order creation failed",
      message: error.message || "Unknown error",
    });
  }
};

export const verifyPaymentController = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    console.log("------------------------------------------");
    console.log("Verifying payment for order:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);

    // 1. Verify Signature
    const secret = env.RAZORPAY_KEY_SECRET;
    
    // Official Razorpay utility way
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.error("SIGNATURE MISMATCH!");
      console.log("Expected:", generated_signature.substring(0, 10) + "...");
      console.log("Received:", razorpay_signature.substring(0, 10) + "...");
      
      return res.status(400).json({
        success: false,
        error: "Invalid signature",
        message: "Payment verification failed. Please contact support if money was deducted."
      });
    }

    // 2. Save/Update payment in DB
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        userId: req.user.id,
        amount: 499,
        status: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log("Payment SUCCESS for User:", req.user.id);
    console.log("------------------------------------------");

    return res.json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error("CRITICAL Verification ERROR:", err);
    res.status(500).json({ 
      error: "Server Error during verification", 
      message: err.message 
    });
  }
};

export const getPaymentHistoryController = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
