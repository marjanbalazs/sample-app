import express, { Express } from "express";
import { Db, MongoClient } from "mongodb";
import { ApolloServer } from "apollo-server-express";
import { Resolvers } from "sample-app-graphql-schema/src/generated/resolver-types";
import {
  getCollections,
  getCollection,
  getTask,
  createCollection,
  createTask,
  updateTask,
  deleteTask
} from "./resolvers";
import fs from "fs";

const typedefs = fs
  .readFileSync("node_modules/sample-app-graphql-schema/src/schema.graphql")
  .toString("utf-8");

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "myProject";

const init = async (
  client: MongoClient,
  app: Express
): Promise<{
  db: Db;
  server: ApolloServer;
  app: Express;
}> => {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);

  console.log("Initializing Apollo Middleware");
  const resolvers: Resolvers = {
    Query: {
      getCollections,
      getCollection,
      getTask,
    },
    Mutation: {
      createCollection,
      createTask,
      updateTask,
      deleteTask,
    },
  };
  const server = new ApolloServer({
    typeDefs: typedefs,
    resolvers: resolvers,
    context: {
      db,
    },
  });
  await server.start();
  return {
    db,
    server,
    app,
  };
};

const app = express();
app.use(express.json());
app.get("/hello", (req, res) => {
  res.status(200).send();
});

init(client, app)
  .then(({ db, server, app }) => {
    const middleware = server.getMiddleware({
      path: "/graphql",
    });
    app.use(middleware);
    app.listen(3000, () => console.log("Server started"));
  })
  .catch((e) => console.error(e));
