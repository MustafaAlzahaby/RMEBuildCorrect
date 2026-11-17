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
  const userFilter = { userId: user._id };
  const collection = LibraryActivity.collection.name;

  // Recover category visits from older subcategory records with a parent breadcrumb.
  // An explicit open for the same category takes precedence over inferred history.
  const [timeline] = await LibraryActivity.aggregate([
    { $match: userFilter },
    {
      $unionWith: {
        coll: collection,
        pipeline: [
          { $match: { ...userFilter, kind: "subcategory", context: / \/ / } },
          {
            $project: {
              occurredAt: 1,
              parent: {
                $trim: {
                  input: { $arrayElemAt: [{ $split: ["$context", " / "] }, 0] },
                },
              },
            },
          },
          { $match: { parent: { $ne: "" } } },
          { $group: { _id: "$parent", occurredAt: { $max: "$occurredAt" } } },
          {
            $lookup: {
              from: collection,
              let: { parent: "$_id" },
              pipeline: [
                { $match: { ...userFilter, kind: "category" } },
                { $match: { $expr: { $eq: ["$title", "$$parent"] } } },
                { $limit: 1 },
              ],
              as: "directOpens",
            },
          },
          { $match: { "directOpens.0": { $exists: false } } },
          {
            $project: {
              _id: { $concat: ["inferred-category:", "$_id"] },
              kind: { $literal: "category" },
              title: "$_id",
              occurredAt: 1,
              inferred: { $literal: true },
            },
          },
        ],
      },
    },
    {
      $facet: {
        items: [
          ...(req.query.kind ? [{ $match: { kind: req.query.kind } }] : []),
          { $sort: { occurredAt: -1, _id: -1 } },
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize + 1 },
          {
            $project: {
              kind: 1,
              title: 1,
              context: 1,
              occurredAt: 1,
              inferred: 1,
            },
          },
        ],
        counts: [{ $group: { _id: "$kind", count: { $sum: 1 } } }],
      },
    },
  ]);
  const { items, counts } = timeline;

  res.set("Cache-Control", "private, no-store");
  res.json({
    events: items.slice(0, pageSize),
    counts: Object.fromEntries(counts.map(({ _id, count }) => [_id, count])),
    hasNext: items.length > pageSize && page < 10000,
  });
});

module.exports = { recordLibraryActivity, getLibraryActivity };
