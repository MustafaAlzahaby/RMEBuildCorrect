const mongoose = require("mongoose");
const { env } = require("./env");

mongoose.set("strictQuery", true);

let connecting;

async function openConnection() {
  const connection = mongoose.connection;
  if (connection.getClient()) {
    await connection.close();
  }

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5_000,
  });
  console.log("Connected to MongoDB");
  return connection;
}

async function connectDb() {
  if (connecting) return connecting;
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  connecting = openConnection().finally(() => {
    connecting = undefined;
  });

  return connecting;
}

async function checkDbReady() {
  const connection = await connectDb();
  await connection.db.command({ ping: 1 }, { timeoutMS: 5_000 });
}

module.exports = { connectDb, checkDbReady };
