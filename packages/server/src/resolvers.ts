import { Db } from "mongodb";
import { QueryResolvers } from "sample-app-graphql-schema/src/generated/resolver-types";

type Context = {
  db: Db;
};

export const getCollections: QueryResolvers<Context>["getCollections"] = async (
  parent,
  args,
  context
) => {
  const { db } = context;
  const collections = await db
    .listCollections(
      {},
      {
        nameOnly: true,
      }
    )
    .toArray();
  return collections.map((collection) => collection.name);
};
