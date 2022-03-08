import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";
import Contract, {
  ContractTemplate,
  templateMapping,
} from "../models/Contract.model";
import ContractType from "./types/contract";
import { TemplateType } from "./types/template";

const ContractQueries = {
  contract: {
    type: ContractType,
    args: {
      address: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: async (parent, args, ctx, info) => {
      return await Contract.findOne({ where: { address: args.address } });
    },
  },
};

const ContractMutations = {
  importContract: {
    type: ContractType,
    args: {
      address: {
        type: new GraphQLNonNull(GraphQLString),
      },
      chainId: {
        type: new GraphQLNonNull(GraphQLInt),
      },
    },
    resolve: async (parent, args, ctx, info) => {
      return await Contract.importByAddressAndChain(args.address, args.chainId);
    },
  },
  createFromTemplate: {
    type: ContractType,
    args: {
      chainId: {
        type: new GraphQLNonNull(GraphQLInt),
      },
      template: {
        type: new GraphQLNonNull(TemplateType),
      },
      params: {
        type: GraphQLJSONObject,
      },
    },
    resolve: async (parent, args, ctx, info) => {
      return await Contract.createFromTemplate(
        args.template,
        args.params,
        args.chainId
      );
    },
  },
  getJSONForTemplate: {
    type: GraphQLString,
    args: {
      chainId: {
        type: new GraphQLNonNull(GraphQLInt),
      },
      template: {
        type: new GraphQLNonNull(TemplateType),
      },
      params: {
        type: GraphQLJSONObject,
      },
    },
    resolve: async (parent, args, ctx, info) => {
      const toDeploy = new templateMapping[args.template](args.params);
      return toDeploy.write();
    },
  },
};

export { ContractQueries, ContractMutations };
