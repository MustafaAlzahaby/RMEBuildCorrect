// Re-runnable preview data. Existing guides keep their IDs, assets and progress.
const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");
const { env } = require("../src/config/env");
const { csiTaxonomy } = require("../src/data/csiTaxonomy");
const Category = require("../src/models/Category");
const Lesson = require("../src/models/Lesson");

async function main() {
  if (env.FILE_STORAGE !== "local") {
    throw new Error("This preview seed requires local file storage for its sample covers.");
  }
  await mongoose.connect(env.MONGODB_URI);
  const concrete = csiTaxonomy.find((division) => division.code === "03");
  const sections = await Category.find({ code: { $in: concrete.sections.map(([code]) => code) } });
  if (sections.length !== concrete.sections.length) {
    throw new Error("Run seed-categories first: all seven Concrete sections are required.");
  }

  const migrations = [
    ["concrete-formwork", "03 30 00"],
    ["mep-services", "22"],
  ];
  // Resolve all destinations before changing any records.
  const targets = await Promise.all(migrations.map(async ([slug, code]) => {
    const destination = await Category.findOne({ code });
    if (!destination) throw new Error(`Missing destination category ${code}`);
    return { slug, destination };
  }));
  for (const { slug, destination } of targets) {
    const old = await Category.findOne({ slug });
    if (!old) continue;
    if (await Category.exists({ parentId: old._id })) {
      throw new Error(`Cannot remove ${slug}: it still has subcategories`);
    }
    const result = await Lesson.updateMany({ categoryId: old._id }, { $set: { categoryId: destination._id } });
    await Category.deleteOne({ _id: old._id });
    console.log(`Removed ${slug}; preserved ${result.modifiedCount} guide(s) in ${destination.code}.`);
  }

  const assetDirectory = path.resolve(__dirname, "../uploads/demo-library");
  await fs.mkdir(assetDirectory, { recursive: true });
  for (const section of sections) {
    for (const [index, topic] of ["Work sequence overview", "Inspection record walkthrough"].entries()) {
      const slug = `demo-concrete-${section.code.replaceAll(" ", "")}-${index + 1}`;
      const fileName = `${slug}.svg`;
      const cover = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
        <rect width="1200" height="675" fill="#19212c"/>
        <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#94a3b8" stroke-opacity=".1"/></pattern></defs>
        <rect width="1200" height="675" fill="url(#grid)"/>
        <path d="M680 240 880 140 1080 240 880 340Z" fill="#748397"/>
        <path d="M680 240V440L880 540V340Z" fill="#475569"/>
        <path d="M880 340 1080 240V440L880 540Z" fill="#334155"/>
        <path d="M660 465 880 575 1100 465" fill="none" stroke="#ef4444" stroke-width="5"/>
        <rect x="65" y="70" width="185" height="40" rx="6" fill="#b91c1c"/>
        <text x="85" y="98" fill="white" font-family="sans-serif" font-size="20" font-weight="bold">DEMO PREVIEW</text>
        <text x="65" y="260" fill="#f87171" font-family="monospace" font-size="44">${section.code}</text>
        <text x="65" y="330" fill="white" font-family="sans-serif" font-size="48" font-weight="bold">CONCRETE</text>
        <text x="65" y="385" fill="#cbd5e1" font-family="sans-serif" font-size="24">${topic}</text>
        <text x="65" y="580" fill="#94a3b8" font-family="sans-serif" font-size="20">Sample guide ${index + 1} / Library layout preview</text>
      </svg>`;
      await fs.writeFile(path.join(assetDirectory, fileName), cover);
      const subject = `${section.code} — ${section.name}`;
      await Lesson.findOneAndUpdate({ slug }, { $set: {
        slug,
        title: `[DEMO] ${section.name} — ${topic}`,
        categoryId: section._id,
        description: `Demo content for ${subject}. Preview a ${index === 0 ? "work sequence guide" : "completed inspection record"} with sample notes and documentation. For UI testing only.`,
        images: [`local/demo-library/${fileName}`],
        instructions: `DEMO — ${topic}\n\nSection: ${subject}\nSample project: Library Preview / Zone A / Level 01\n\n1. Review the sample scope and document references.\n2. Record the selected work area and responsible team.\n3. Add progress notes and supporting photographs.\n4. Submit the example record for review.\n\nThis is placeholder content for layout testing, not a construction procedure.`,
        bestPractices: "DEMO\n\nKeep related records together. Use clear photo captions and consistent document names. Record the revision, work area, author and review status. Replace these notes with project-approved content before actual use.",
        methodStatement: `DEMO METHOD STATEMENT\n\nScope: ${subject}\nLocation: Zone A / Level 01\nRevision: Preview 01\nStatus: Example only\n\nPreparation: Add approved drawings, responsibilities and project requirements.\nExecution: Add the approved work sequence and supporting references.\nCloseout: Attach the completed inspection record and reviewer comments.`,
        itp: "DEMO INSPECTION RECORD\n\nDocument review — Example status: Complete\nWork area reference — Example status: Recorded\nSupporting photos — Example status: Attached\nReviewer comments — Example status: Awaiting review\n\nAcceptance criteria and hold points must come from the approved project documents.",
        lessonLearnt: `DEMO LESSON LEARNT\n\nObservation: The ${section.code} sample record needed a clearer location reference.\nImprovement: Include the zone and level in the record heading and photo captions.\nFollow-up: Use the same naming format in the next example.`,
      } }, { upsert: true, runValidators: true, new: true });
    }
  }
  const demoCount = await Lesson.countDocuments({ slug: /^demo-concrete-/ });
  const remaining = await Category.countDocuments({ slug: { $in: migrations.map(([slug]) => slug) } });
  if (demoCount !== 14 || remaining !== 0) throw new Error("Preview verification failed");
  const counts = await Lesson.aggregate([
    { $match: { slug: /^demo-concrete-/, categoryId: { $in: sections.map((section) => section._id) } } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);
  if (counts.length !== 7 || counts.some((entry) => entry.count !== 2)) {
    throw new Error("Expected exactly two demo guides in each Concrete section");
  }
  console.log(`Verified: ${demoCount} demo guides across seven Concrete sections; no legacy categories remain.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
