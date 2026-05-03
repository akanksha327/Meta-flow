import { prisma } from '../models/index.js';

async function test() {
  const userId = "dev-user-id";
  const billingCycleStart = new Date();
  billingCycleStart.setDate(1);

  console.log("Testing usageLog.count...");
  try {
    const count = await prisma.usageLog.count({
      where: {
        apiKey: {
          api: {
            userId,
          },
        },
      },
    });
    console.log("usageLog.count success:", count);
  } catch (err) {
    console.error("usageLog.count failed:", err.message);
  }

  console.log("\nTesting payment.aggregate...");
  try {
    const sum = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userId,
        status: "PAID",
        completedAt: {
          gte: billingCycleStart,
        },
      },
    });
    console.log("payment.aggregate success:", sum);
  } catch (err) {
    console.error("payment.aggregate failed:", err.message);
  }

  console.log("\nTesting user.findUnique...");
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    console.log("user.findUnique success:", user);
  } catch (err) {
    console.error("user.findUnique failed:", err.message);
  }
}

test();
