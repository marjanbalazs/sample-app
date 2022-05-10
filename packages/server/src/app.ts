import "dotenv/config";
import express, { Express } from "express";
import { Db, MongoClient } from "mongodb";
import { ApolloServer } from "apollo-server-express";
import { resolvers } from "./resolvers";
import { logger } from "./utils";
import typedefs from "../generated/schema.graphql";

const mongoHost = process.env.MONGO_HOST as string;
const mongoPort = process.env.MONGO_PORT as string;
const mongoDBName = process.env.MONGO_DB_NAME as string;

// Connection URL
const mongoURL = `mongodb://${mongoHost}:${mongoPort}`;
const mongoClient = new MongoClient(mongoURL);

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
  const db = client.db(mongoDBName);

  logger.debug("Initializing Apollo Middleware");
  const server = new ApolloServer({
    typeDefs: typedefs,
    resolvers: resolvers,
    context: {
      db,
      logger,
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

init(mongoClient, app)
  .then(({ server, app }) => {
    const middleware = server.getMiddleware({
      path: "/graphql",
    });
    app.use(middleware);
    app.listen(3000, () => logger.debug("Server started"));
  })
  .catch((e) => logger.error(e));
