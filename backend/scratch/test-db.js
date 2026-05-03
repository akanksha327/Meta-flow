
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../../backend/.env") });

const MONGO_URI = process.env.MONGO_URI;

const apiSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    baseUrl: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

const Api = mongoose.model("ApiTest", apiSchema);

async function test() {
  if (!MONGO_URI) {
    console.error("MONGO_URI not found in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const userId = new mongoose.Types.ObjectId();
    const api = await Api.create({
      name: "Test API",
      baseUrl: "https://example.com",
      userId,
    });

    console.log("API created successfully:", api);
    
    await Api.deleteOne({ _id: api._id });
    console.log("Test API deleted");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

test();
