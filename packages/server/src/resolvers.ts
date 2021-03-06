import { ApolloError } from "apollo-server-express";
import type { Logger } from "log4js";
import { Db, Document, ObjectId, WithId } from "mongodb";
import {
  MutationResolvers,
  QueryResolvers,
  Resolvers,
  Task,
} from "./../generated/resolver-types";

type Context = {
  db: Db;
  logger: Logger;
};

const mapDocumentToTask = (dbTask: WithId<Document>): Task => {
  const { _id, ...rest } = dbTask as WithId<Task>;
  return {
    ...rest,
    id: _id.toString(),
  };
};

export const getCollections: QueryResolvers<Context>["getCollections"] = async (
  parent,
  args,
  { db, logger }
) => {
  try {
    const collections = await db
      .listCollections(
        {},
        {
          nameOnly: false,
        }
      )
      .toArray();
    return collections.map((collection) => ({
      id: collection.info?.uuid?.toString() as string,
      name: collection.name,
    }));
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

export const getCollection: QueryResolvers<Context>["getCollection"] = async (
  parent,
  { name },
  { db, logger }
) => {
  try {
    const collections = await db.collections();
    const ourCollection = collections.find(
      (collection) => collection.collectionName === name
    );
    if (ourCollection) {
      const tasks = (await ourCollection.find({}).toArray()).map(
        mapDocumentToTask
      );
      return {
        id: ourCollection.collectionName,
        name: ourCollection.collectionName,
        tasks: tasks,
      };
    } else {
      throw new ApolloError("No collection found");
    }
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

export const getTask: QueryResolvers<Context>["getTask"] = async (
  parent,
  { collectionName, taskId },
  { db, logger }
) => {
  try {
    const collections = await db.collections();
    const ourCollection = collections.find(
      (collection) => collection.collectionName === collectionName
    );
    if (ourCollection) {
      const task = await ourCollection.findOne({
        _id: new ObjectId(taskId),
      });
      if (task) {
        return mapDocumentToTask(task);
      } else {
        throw new ApolloError("No task found");
      }
    } else {
      throw new ApolloError("No collection found");
    }
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

export const createCollection: MutationResolvers<Context>["createCollection"] =
  async (parent, { collectionName }, { db, logger }) => {
    try {
      await db.createCollection(collectionName);
      return collectionName;
    } catch (e) {
      logger.error(e);
      throw e;
    }
  };

export const createTask: MutationResolvers<Context>["createTask"] = async (
  parent,
  { collectionName, input },
  { db, logger }
) => {
  try {
    const collection = db.collection<{ name: string; tags?: string[] | null }>(
      collectionName
    );
    const result = await collection.insertOne({
      name: input.name,
      tags: input.tags,
    });
    return {
      id: result.insertedId.toString(),
      name: input.name,
      tags: input.tags,
    };
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

export const updateTask: MutationResolvers<Context>["updateTask"] = async (
  parent,
  { collectionName, taskId, input },
  { db, logger }
) => {
  try {
    const collection = db.collection(collectionName);
    const updatedDoc = await collection.findOneAndUpdate(
      {
        _id: new ObjectId(taskId),
      },
      {
        $set: {
          ...input,
        },
      },
      {
        returnDocument: "after",
      }
    );
    if (!updatedDoc.value) {
      throw new ApolloError("Updated doc could not be fetched");
    }
    return mapDocumentToTask(updatedDoc.value);
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

export const deleteTask: MutationResolvers<Context>["deleteTask"] = async (
  parent,
  { collectionName, taskId },
  { db, logger }
) => {
  try {
    const collection = db.collection<Task>(collectionName);
    const deleteResult = await collection.findOneAndDelete({
      _id: new ObjectId(taskId),
    });
    if (deleteResult.ok) {
      return true;
    }
    return false;
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

export const resolvers: Resolvers<Context> = {
  Collection: {
    tasks: async (parent, args, context) => {
      const { name } = parent;
      const { db } = context;
      return (await db.collection(name).find({}).toArray()).map(
        mapDocumentToTask
      );
    },
  },
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
