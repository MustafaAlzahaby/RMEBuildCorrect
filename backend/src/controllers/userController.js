const LibraryActivity = require("../models/LibraryActivity");
const User = require("../models/User");
const LessonProgress = require("../models/LessonProgress");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");

const listUsers = asyncHandler(async (_req, res) => {
  const [users, progressCounts] = await Promise.all([
    User.find().sort({ createdAt: -1 }),
    LessonProgress.aggregate([
      {
        $group: {
          _id: "$userId",
          guideViews: { $sum: 1 },
          trackedOpens: { $sum: "$openCount" },
          completedGuides: {
            $sum: { $cond: [{ $ne: [{ $ifNull: ["$completedAt", null] }, null] }, 1, 0] },
          },
          lastViewedAt: { $max: "$viewedAt" },
        },
      },
    ]),
  ]);

  const countsByUser = new Map(
    progressCounts.map((item) => [
      item._id.toString(),
      {
        guideViews: item.guideViews,
        trackedOpens: item.trackedOpens,
        completedGuides: item.completedGuides,
        lastViewedAt: item.lastViewedAt,
      },
    ]),
  );

  res.json({
    users: users.map((user) => ({
      ...user.toJSON(),
      progressSummary: countsByUser.get(user._id.toString()) || {
        guideViews: 0,
        trackedOpens: 0,
        completedGuides: 0,
        lastViewedAt: null,
      },
    })),
  });
});

const getUserActivity = asyncHandler(async (req, res) => {
  const user = await User.exists({ _id: req.params.id });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const page = Number(req.query.page ?? 1);
  const pageSize = 25;
  const items = await LessonProgress.find({ userId: user._id })
    .sort({ viewedAt: -1, _id: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize + 1)
    .select("lessonId viewedAt completedAt openCount")
    .populate("lessonId", "title")
    .lean();

  res.json({
    hasNext: items.length > pageSize,
    guides: items.slice(0, pageSize).map((item) => ({
      id: item._id,
      guideId: item.lessonId?._id ?? null,
      title: item.lessonId?.title ?? null,
      lastOpenedAt: item.viewedAt ?? null,
      completedAt: item.completedAt ?? null,
      trackedOpens: item.openCount ?? 0,
    })),
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const patch = {};

  if (req.body.role !== undefined) {
    patch.role = req.body.role;
  }

  if (req.body.isActive !== undefined) {
    patch.isActive = req.body.isActive;
  }

  const user = await User.findByIdAndUpdate(req.params.id, patch, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await Promise.all([
    LessonProgress.deleteMany({ userId: user._id }),
    LibraryActivity.deleteMany({ userId: user._id }),
  ]);
  res.status(204).send();
});

module.exports = { deleteUser, getUserActivity, listUsers, updateUser };
