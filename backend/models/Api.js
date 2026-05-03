import mongoose from "mongoose";

const apiSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    baseUrl: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "apis",
  }
);

export const Api = mongoose.model("Api", apiSchema);
