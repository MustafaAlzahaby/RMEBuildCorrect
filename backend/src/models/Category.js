const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      default: "",
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.parentId = ret.parentId ? ret.parentId.toString() : null;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

categorySchema.index({ parentId: 1, code: 1 });

module.exports = mongoose.model("Category", categorySchema);
