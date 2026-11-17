const mongoose = require("mongoose");

const libraryActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  kind: {
    type: String,
    enum: ["category", "subcategory", "workspace", "tab", "file", "download"],
    required: true,
  },
  title: { type: String, required: true, maxlength: 300 },
  context: { type: String, maxlength: 600 },
  occurredAt: { type: Date, default: Date.now, required: true },
});

libraryActivitySchema.index({ userId: 1, kind: 1, occurredAt: -1, _id: -1 });
libraryActivitySchema.index({ userId: 1, occurredAt: -1, _id: -1 });

module.exports = mongoose.model("LibraryActivity", libraryActivitySchema);
