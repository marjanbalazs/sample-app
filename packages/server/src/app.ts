import express, { Express } from "express";
import { Db, MongoClient } from "mongodb";
import { ApolloServer } from "apollo-server-express";
import { resolvers } from "./resolvers";
import { logger } from "./utils";
import typedefs from "../generated/schema.graphql";

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
  await client.connect();
  logger.debug("Connected successfully to server");
  const db = client.db(dbName);

  logger.debug("Initializing Apollo Middleware");
  const server = new ApolloServer({
    typeDefs: typedefs,
    resolvers: resolvers,
    context: {
      db,
      logger: logger,
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
    app.listen(3000, () => logger.debug("Server started"));
  })
  .catch((e) => logger.error(e));
