const Category = require("../models/Category");
const Lesson = require("../models/Lesson");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { createSlug } = require("../utils/slug");
const { signLessonAssets } = require("../services/s3Service");

const listCategories = asyncHandler(async (_req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ code: 1, name: 1 }),
    Lesson.aggregate([
      { $group: { _id: "$categoryId", lessonCount: { $sum: 1 } } },
    ]),
  ]);

  const countsByCategory = new Map(
    counts.map((item) => [item._id.toString(), item.lessonCount]),
  );

  const serialized = categories.map((category) => {
    const data = category.toJSON();
    return {
      ...data,
      lessonCount: countsByCategory.get(category._id.toString()) || 0,
    };
  });

  serialized.forEach((category) => {
    if (category.parentId) {
      const parent = serialized.find((item) => item.id === category.parentId);
      if (parent) {
        parent.lessonCount += category.lessonCount;
      }
    }
  });

  res.json({ categories: serialized });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const lessons = await Lesson.find({ categoryId: category._id }).sort({ createdAt: -1 });
  const signedLessons = await Promise.all(lessons.map((lesson) => signLessonAssets(lesson)));

  res.json({
    category: {
      ...category.toJSON(),
      lessonCount: lessons.length,
    },
    lessons: signedLessons,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const slug = req.body.slug ? createSlug(req.body.slug) : createSlug(req.body.name);
  const category = await Category.create({
    name: req.body.name,
    slug,
    code: req.body.code,
    parentId: req.body.parentId || null,
    description: req.body.description,
    thumbnailUrl: req.body.thumbnailUrl,
  });

  res.status(201).json({ category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const patch = { ...req.body };

  if (patch.slug) {
    patch.slug = createSlug(patch.slug);
  }

  if (patch.parentId === "" || patch.parentId === "none") {
    patch.parentId = null;
  }

  const category = await Category.findByIdAndUpdate(req.params.id, patch, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.json({ category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const hasLessons = await Lesson.exists({ categoryId: req.params.id });
  if (hasLessons) {
    throw new AppError("Cannot delete a category that still has guides", 409);
  }

  const hasChildren = await Category.exists({ parentId: req.params.id });
  if (hasChildren) {
    throw new AppError("Cannot delete a division that still has sections", 409);
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.status(204).send();
});

module.exports = {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
};
