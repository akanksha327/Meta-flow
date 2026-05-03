import mongoose from "mongoose";
import { env } from "../config/env.js";

async function dropOldStripeIndex() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected.");

    const collection = mongoose.connection.collection("payments");
    
    console.log("Listing indexes...");
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes.map(i => i.name));

    const stripeIndex = indexes.find(i => i.name === "stripeSessionId_1");
    
    if (stripeIndex) {
      console.log("Dropping index 'stripeSessionId_1'...");
      await collection.dropIndex("stripeSessionId_1");
      console.log("Index dropped successfully.");
    } else {
      console.log("Index 'stripeSessionId_1' not found. It might have been dropped already.");
    }

    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
  }
}

dropOldStripeIndex();
