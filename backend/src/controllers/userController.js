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
        lastViewedAt: item.lastViewedAt,
      },
    ]),
  );

  res.json({
    users: users.map((user) => ({
      ...user.toJSON(),
      progressSummary: countsByUser.get(user._id.toString()) || {
        guideViews: 0,
        lastViewedAt: null,
      },
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

  await LessonProgress.deleteMany({ userId: user._id });
  res.status(204).send();
});

module.exports = { deleteUser, listUsers, updateUser };
