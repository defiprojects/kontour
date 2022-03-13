import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { GraphQLUpload } from "graphql-upload";
import ApiKey from "../models/ApiKey.model";
import ContractSource from "../models/ContractSource.model";
import S3ContractSource from "../models/S3ContractSource.model";
import { uploadFile } from "../utils/s3";
import ContractSourceType from "./types/contractSource";

const ContractSourceQueries = {
  contractSource: {
    type: ContractSourceType,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: async (parent, args, ctx, info) => {
      const source = await ContractSource.findByPk(args.id);
      if (source.user_id !== ctx.state?.user?.id) {
        return null;
      }
      return source;
    },
  },
  s3ContractSource: {
    type: ContractSourceType,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: async (parent, args, ctx, info) => {
      const source = await S3ContractSource.findByPk(args.id);
      if (source.user_id !== ctx.state?.user?.id) {
        return null;
      }
      return source;
    },
  },
  myContractSources: {
    type: new GraphQLNonNull(
      new GraphQLList(new GraphQLNonNull(ContractSourceType))
    ),
    args: {},
    resolve: async (parent, args, ctx, info) => {
      const userId = ctx.state?.user?.id;
      if (!userId) {
        return [];
      }
      const s3Sources = await S3ContractSource.findAll({
        where: {
          user_id: userId,
        },
      });
      const sources = await ContractSource.findAll({
        where: {
          user_id: userId,
        },
      });
      return [...s3Sources, ...sources];
    },
  },
};

const ContractSourceMutations = {
  createFromTruffleJSON: {
    type: ContractSourceType,
    args: {
      truffleJSON: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: async (parent, args, ctx, info) => {
      return await S3ContractSource.uploadToS3(
        ctx.state.user.id,
        JSON.parse(args.truffleJSON)
      );
    },
  },
  createFromS3File: {
    type: ContractSourceType,
    args: {
      key: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: async (parent, args, ctx, info) => {
      return await S3ContractSource.importFromS3(args.key, ctx.state.user.id);
    },
  },
  ingestFromQuikdraw: {
    type: ContractSourceType,
    args: {
      file: {
        type: GraphQLUpload,
      },
      apiKey: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: async (parent, args, ctx, info) => {
      const apiKey = await ApiKey.findByPk(args.apiKey);

      const { filename, mimetype, createReadStream, encoding } =
        await args.file;
      const fileChunks = [];
      const stream = createReadStream();
      stream.on("readable", () => {
        let chunk;
        while (null !== (chunk = stream.read())) {
          fileChunks.push(chunk);
        }
      });
      await new Promise<void>((resolve) =>
        stream.on("end", async () => {
          const imageBuffer = Buffer.concat(fileChunks);
          await uploadFile(apiKey.user_id, filename, mimetype, imageBuffer);
          resolve();
        })
      );
    },
  },
};

export { ContractSourceQueries, ContractSourceMutations };
