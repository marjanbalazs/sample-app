import express from "express";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());
app.get("/hello", (req, res) => {
  res.status(200).send();
});

// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "myProject";

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection("documents");

  // the following code examples can be pasted here...

  return "done.";
}

main().then(console.log).catch(console.error);

app.listen(3000, () => {
  console.log("App is ready");
});
