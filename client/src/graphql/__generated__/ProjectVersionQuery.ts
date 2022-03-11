/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ProjectVersionQuery
// ====================================================

export interface ProjectVersionQuery_projectVersion_contract_sources {
  __typename: "ContractSource";
  id: string;
  name: string;
  constructor: any | null;
  events: any;
  functions: any;
}

export interface ProjectVersionQuery_projectVersion {
  __typename: "ProjectVersion";
  /**
   * The name of the version
   */
  name: string | null;
  /**
   * The contract sources for project version
   */
  contract_sources: ProjectVersionQuery_projectVersion_contract_sources[] | null;
}

export interface ProjectVersionQuery {
  projectVersion: ProjectVersionQuery_projectVersion | null;
}

export interface ProjectVersionQueryVariables {
  version_id: string;
}
