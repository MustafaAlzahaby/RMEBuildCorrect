const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
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
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    instructions: {
      type: String,
      default: "",
      trim: true,
    },
    bestPractices: {
      type: String,
      default: "",
      trim: true,
    },
    methodStatement: {
      type: String,
      default: "",
      trim: true,
    },
    itp: {
      type: String,
      default: "",
      trim: true,
    },
    lessonLearnt: {
      type: String,
      default: "",
      trim: true,
    },
    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    pdfUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

module.exports = mongoose.model("Lesson", lessonSchema);
