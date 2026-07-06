 const Category = require("../models/Category");
const Lesson = require("../models/Lesson");
const LessonProgress = require("../models/LessonProgress");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");

async function buildProgressStats(userId) {
  const [categories, lessons, completed] = await Promise.all([
    Category.find().sort({ name: 1 }),
    Lesson.find().select("categoryId title slug").lean(),
    LessonProgress.find({ userId }).populate("lessonId", "title slug categoryId").lean(),
  ]);

  const lessonTotals = lessons.reduce((map, lesson) => {
    const key = lesson.categoryId.toString();
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());

  const completedTotals = completed.reduce((map, item) => {
    if (!item.lessonId) {
      return map;
    }
    const key = item.lessonId.categoryId.toString();
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());

  const perCategory = categories.map((category) => {
    const key = category._id.toString();
    const totalLessons = lessonTotals.get(key) || 0;
    const completedLessons = completedTotals.get(key) || 0;

    return {
      category: category.toJSON(),
      totalLessons,
      completedLessons,
      completionRate: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
    };
  });

  return { completed, perCategory };
}

const getProgress = asyncHandler(async (req, res) => {
  const { completed, perCategory } = await buildProgressStats(req.user._id);

  res.json({
    completedLessons: completed,
    stats: perCategory,
  });
});

const markComplete = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const progress = await LessonProgress.findOneAndUpdate(
    { userId: req.user._id, lessonId: lesson._id },
    { completedAt: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  res.status(201).json({ progress });
});

const unmarkComplete = asyncHandler(async (req, res) => {
  await LessonProgress.findOneAndDelete({
    userId: req.user._id,
    lessonId: req.params.lessonId,
  });

  res.status(204).send();
});

module.exports = { getProgress, markComplete, unmarkComplete };
