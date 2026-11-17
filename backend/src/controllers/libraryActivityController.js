const LibraryActivity = require("../models/LibraryActivity");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");

const recordLibraryActivity = asyncHandler(async (req, res) => {
  const { kind, title, context } = req.body;
  await LibraryActivity.create({ userId: req.user._id, kind, title, context });
  res.status(204).send();
});

const getLibraryActivity = asyncHandler(async (req, res) => {
  const user = await User.exists({ _id: req.params.id });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const pageSize = 25;
  const page = Number(req.query.page ?? 1);
  const filter = { userId: user._id };
  if (req.query.kind) filter.kind = req.query.kind;

  const [items, counts] = await Promise.all([
    LibraryActivity.find(filter)
      .sort({ occurredAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize + 1)
      .select("kind title context occurredAt")
      .lean(),
    LibraryActivity.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: "$kind", count: { $sum: 1 } } },
    ]),
  ]);

  res.set("Cache-Control", "private, no-store");
  res.json({
    events: items.slice(0, pageSize),
    counts: Object.fromEntries(counts.map(({ _id, count }) => [_id, count])),
    hasNext: items.length > pageSize && page < 10000,
  });
});

module.exports = { recordLibraryActivity, getLibraryActivity };
