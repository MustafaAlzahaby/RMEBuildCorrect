const app = require("./app");
const { connectDb } = require("./config/db");
const { env } = require("./config/env");

async function start() {
  await connectDb();

  app.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
