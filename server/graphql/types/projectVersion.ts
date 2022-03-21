import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import GraphQLJSONObject from "graphql-type-json";
import config from "../../../config";
import LocalContractSource from "../../models/LocalContractSource.model";
import { ProjectVersionStatus } from "../../models/ProjectVersion.model";
import RemoteContractSource from "../../models/RemoteContractSource.model";
import { encodeId, SdkIdType } from "../../routes/sdk";
import ContractSourceType from "./contractSource";
import InstanceType from "./instance";

const ProjectVersionType = new GraphQLObjectType({
  name: "ProjectVersion",
  description: "A version for a project",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The uuid of this project",
    },
    name: {
      type: GraphQLString,
      description: "The name of the version",
    },
    data: {
      type: GraphQLJSONObject,
    },
    sdk_url: {
      type: GraphQLString,
      resolve: (parent, args, ctx, info) => {
        return `${config.app.PROTOCOL}://${config.app.HOSTNAME}/sdk/${encodeId(
          SdkIdType.VERSION,
          parent.id,
          parent.name
        )}`;
      },
    },
    contract_sources: {
      type: new GraphQLList(new GraphQLNonNull(ContractSourceType)),
      description: "The contract sources for project version",
      resolve: async (parent, args, ctx, info) => {
        let local = [],
          remote = [];
        if (parent.data.local_sources) {
          local = await LocalContractSource.findAll({
            where: {
              id: Object.values(parent.data.local_sources) as string[],
            },
          });
          const instance = await parent.getHead();
          local = await LocalContractSource.replaceLibraries(
            instance.id,
            local
          );
        }
        if (parent.data.remote_sources) {
          remote = await RemoteContractSource.findAll({
            where: {
              id: Object.values(parent.data.remote_sources) as string[],
            },
          });
        }
        return local.concat(remote);
      },
    },
    project_id: {
      type: GraphQLString,
      description: "The id of the project this version belongs to",
    },
    node_id: {
      type: GraphQLString,
      description: "The id of the node this version belongs to",
      resolve: async (parent, args, ctx, info) => {
        return (await parent.$get("project")).node_id;
      },
    },
    status: {
      type: GraphQLInt,
      description: "The ProjectVersionStatus of this version",
    },
    head_instance: {
      type: InstanceType,
      description: "The head revision instance of this version",
      resolve: async (parent, args, ctx, info) => {
        return await parent.getHead();
      },
    },
    mainnet_node: {
      type: GraphQLJSONObject,
      resolve: async (parent, args, ctx, info) => {
        if (parent.status === ProjectVersionStatus.MAINNET) {
          return {
            hostUrl: "https://rpc-mainnet.matic.network",
            chainId: "137",
          };
        }
      },
    },
  },
});

export default ProjectVersionType;
