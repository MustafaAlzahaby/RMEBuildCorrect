const mongoose = require("mongoose");
const Category = require("../models/Category");
const Lesson = require("../models/Lesson");
const LessonProgress = require("../models/LessonProgress");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { createSlug } = require("../utils/slug");
const { signLessonAssets, uploadFile } = require("../services/s3Service");

async function resolveCategoryFilter(value) {
  if (!value) {
    return {};
  }

  if (mongoose.Types.ObjectId.isValid(value)) {
    return { categoryId: value };
  }

  const category = await Category.findOne({ slug: value });
  if (!category) {
    return { categoryId: null };
  }

  return { categoryId: category._id };
}

function pickLessonFields(body) {
  const allowed = [
    "title",
    "slug",
    "categoryId",
    "description",
    "instructions",
    "bestPractices",
    "methodStatement",
  ];

  return allowed.reduce((patch, field) => {
    if (body[field] !== undefined) {
      patch[field] = body[field];
    }
    return patch;
  }, {});
}

async function attachUploadedAssets(patch, files = {}) {
  if (files.video?.[0]) {
    patch.videoUrl = await uploadFile(files.video[0], "lessons/videos");
  }

  if (files.pdf?.[0]) {
    patch.pdfUrl = await uploadFile(files.pdf[0], "lessons/pdfs");
  }

  if (files.images?.length) {
    patch.images = await Promise.all(
      files.images.map((file) => uploadFile(file, "lessons/images")),
    );
  }
}

const listLessons = asyncHandler(async (req, res) => {
  const filter = await resolveCategoryFilter(req.query.category);
  const lessons = await Lesson.find(filter)
    .populate("categoryId", "name slug")
    .sort({ createdAt: -1 });
  const signedLessons = await Promise.all(lessons.map((lesson) => signLessonAssets(lesson)));

  res.json({ lessons: signedLessons });
});

const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findOne({ slug: req.params.slug }).populate("categoryId", "name slug");

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  res.json({ lesson: await signLessonAssets(lesson) });
});

const createLesson = asyncHandler(async (req, res) => {
  const patch = pickLessonFields(req.body);
  patch.slug = patch.slug ? createSlug(patch.slug) : createSlug(patch.title);

  const category = await Category.findById(patch.categoryId);
  if (!category) {
    throw new AppError("Category not found", 400);
  }

  await attachUploadedAssets(patch, req.files);

  const lesson = await Lesson.create(patch);
  res.status(201).json({ lesson: await signLessonAssets(lesson) });
});

const updateLesson = asyncHandler(async (req, res) => {
  const patch = pickLessonFields(req.body);

  if (patch.slug) {
    patch.slug = createSlug(patch.slug);
  }

  if (patch.categoryId) {
    const category = await Category.findById(patch.categoryId);
    if (!category) {
      throw new AppError("Category not found", 400);
    }
  }

  await attachUploadedAssets(patch, req.files);

  const lesson = await Lesson.findByIdAndUpdate(req.params.id, patch, {
    new: true,
    runValidators: true,
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  res.json({ lesson: await signLessonAssets(lesson) });
});

const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  await LessonProgress.deleteMany({ lessonId: lesson._id });
  res.status(204).send();
});

module.exports = {
  createLesson,
  deleteLesson,
  getLesson,
  listLessons,
  updateLesson,
};
