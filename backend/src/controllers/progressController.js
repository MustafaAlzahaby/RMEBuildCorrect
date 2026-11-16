const Lesson = require("../models/Lesson");
const LessonProgress = require("../models/LessonProgress");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");

const getProgress = asyncHandler(async (req, res) => {
  const history = await LessonProgress.find({ userId: req.user._id })
    .sort({ viewedAt: -1, completedAt: -1 })
    .limit(12)
    .populate("lessonId", "title slug categoryId")
    .lean();

  res.json({
    history: history
      .filter((item) => item.lessonId)
      .map((item) => ({
        lessonId: item.lessonId,
        viewedAt: item.viewedAt || item.completedAt,
      })),
  });
});

const recordView = asyncHandler(async (req, res) => {
  const lesson = await Lesson.exists({ _id: req.params.lessonId });
  if (!lesson) {
    throw new AppError("Guide not found", 404);
  }

  const progress = await LessonProgress.findOneAndUpdate(
    { userId: req.user._id, lessonId: lesson._id },
    { $max: { viewedAt: new Date() }, $inc: { openCount: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  res.status(201).json({ progress });
});

const completeGuide = asyncHandler(async (req, res) => {
  const lesson = await Lesson.exists({ _id: req.params.lessonId });
  if (!lesson) {
    throw new AppError("Guide not found", 404);
  }

  const progress = await LessonProgress.findOneAndUpdate(
    { userId: req.user._id, lessonId: lesson._id },
    [{ $set: { completedAt: { $ifNull: ["$completedAt", "$$NOW"] } } }],
    { new: true, updatePipeline: true },
  );
  if (!progress) {
    throw new AppError("Open the guide before marking it as reviewed", 409);
  }
  res.json({ progress });
});

module.exports = { getProgress, recordView, completeGuide };
