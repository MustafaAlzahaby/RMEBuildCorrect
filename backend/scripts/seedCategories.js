const mongoose = require("mongoose");
const { env } = require("../src/config/env");
const Category = require("../src/models/Category");

const categories = [
  {
    name: "Site Safety & HSE",
    slug: "site-safety-hse",
    description: "Site inductions, permits, risk controls, PPE, and safe working practices.",
  },
  {
    name: "Surveying & Setting Out",
    slug: "surveying-setting-out",
    description: "Benchmarks, coordinates, levels, grid lines, and construction setting-out procedures.",
  },
  {
    name: "Earthworks & Excavation",
    slug: "earthworks-excavation",
    description: "Excavation, dewatering, shoring, backfilling, compaction, and soil preparation.",
  },
  {
    name: "Concrete & Formwork",
    slug: "concrete-formwork",
    description: "Formwork systems, concrete placement, curing, testing, and defect prevention.",
  },
  {
    name: "Reinforcement Works",
    slug: "reinforcement-works",
    description: "Rebar cutting, bending, fixing, laps, cover, and pre-pour inspection.",
  },
  {
    name: "Masonry & Plastering",
    slug: "masonry-plastering",
    description: "Blockwork, brickwork, lintels, plaster preparation, application, and quality checks.",
  },
  {
    name: "Structural Steel",
    slug: "structural-steel",
    description: "Fabrication checks, erection, bolting, welding, alignment, and protective coatings.",
  },
  {
    name: "MEP Services",
    slug: "mep-services",
    description: "Mechanical, electrical, plumbing, fire protection, coordination, and testing.",
  },
  {
    name: "Finishes & Fit-Out",
    slug: "finishes-fit-out",
    description: "Waterproofing, screeds, tiling, ceilings, painting, doors, and final finishes.",
  },
  {
    name: "QA/QC & Inspections",
    slug: "qa-qc-inspections",
    description: "ITPs, checklists, material approvals, inspections, testing, and handover records.",
  },
  {
    name: "Lifting & Heavy Equipment",
    slug: "lifting-heavy-equipment",
    description: "Lifting plans, crane operations, rigging, equipment checks, and exclusion zones.",
  },
];

async function seedCategories() {
  await mongoose.connect(env.MONGODB_URI);

  await Promise.all(
    categories.map(({ slug, ...category }) =>
      Category.findOneAndUpdate(
        { slug },
        { ...category, slug },
        { upsert: true, runValidators: true },
      ),
    ),
  );

  console.log(`Categories ready: ${categories.length}`);
  await mongoose.disconnect();
}

seedCategories().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
