const mongoose = require("mongoose");
const { env } = require("../src/config/env");
const { csiTaxonomy } = require("../src/data/csiTaxonomy");
const Category = require("../src/models/Category");
const Lesson = require("../src/models/Lesson");
const { createSlug } = require("../src/utils/slug");

const LEGACY_SLUGS = [
  "site-safety-hse",
  "surveying-setting-out",
  "earthworks-excavation",
  "concrete-formwork",
  "reinforcement-works",
  "masonry-plastering",
  "structural-steel",
  "mep-services",
  "finishes-fit-out",
  "qa-qc-inspections",
  "lifting-heavy-equipment",
];

async function seedCategories() {
  await mongoose.connect(env.MONGODB_URI);

  const keepSlugs = new Set();

  for (const division of csiTaxonomy) {
    const divisionSlug = createSlug(`division ${division.code} ${division.name}`);
    keepSlugs.add(divisionSlug);

    const parent = await Category.findOneAndUpdate(
      { slug: divisionSlug },
      {
        name: division.name,
        slug: divisionSlug,
        code: division.code,
        parentId: null,
        description: `DIVISION ${division.code} - ${division.name}`,
      },
      { upsert: true, new: true, runValidators: true },
    );

    for (const [code, name] of division.sections) {
      const sectionSlug = createSlug(`${code} ${name}`);
      keepSlugs.add(sectionSlug);

      await Category.findOneAndUpdate(
        { slug: sectionSlug },
        {
          name,
          slug: sectionSlug,
          code,
          parentId: parent._id,
          description: `${code} - ${name}`,
        },
        { upsert: true, new: true, runValidators: true },
      );
    }
  }

  const stale = await Category.find({
    $or: [{ slug: { $in: LEGACY_SLUGS } }, { slug: { $nin: [...keepSlugs] } }],
  });

  for (const category of stale) {
    if (keepSlugs.has(category.slug)) continue;

    const hasLessons = await Lesson.exists({ categoryId: category._id });
    const hasChildren = await Category.exists({ parentId: category._id });
    if (hasLessons || hasChildren) continue;

    await Category.deleteOne({ _id: category._id });
  }

  console.log(`CSI categories ready: ${keepSlugs.size}`);
  await mongoose.disconnect();
}

seedCategories().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
