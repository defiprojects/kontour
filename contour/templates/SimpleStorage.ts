import {
  DataLocation,
  StateVariableVisibility,
  ASTWriter,
  PrettyFormatter,
  DefaultASTWriterMapping,
  ASTNodeFactory,
  ASTReader,
  SourceUnit,
  ASTNode,
} from "solc-typed-ast";
import Variable from "../base/variable";
import Constructor from "../blocks/constructor";
import SimpleWrite from "../blocks/simpleWrite";
import { isConstructor, isContract } from "../utils/parsers";
import { ContractType, CTVariable } from "./types";
import SimpleStorageJSON from "../compiled/SimpleStorage.sol.json";
import { serializeVariable } from "./base";
import ReadFunction from "../blocks/read";

export default class SimpleStorage implements ContractType {
  name: string = "SimpleStorage";
  variables: CTVariable[];
  sourceUnits: SourceUnit[];
  contractUnit: any;
  factory: ASTNodeFactory;
  version: string = "0.8.11";

  constructor(params: any) {
    this.variables = params.variables;
    this.setup();
  }

  setup() {
    const reader = new ASTReader();
    this.sourceUnits = reader.read(SimpleStorageJSON);
    this.contractUnit = this.sourceUnits[0].children.filter((n) =>
      isContract(n)
    )[0];
    this.factory = new ASTNodeFactory(this.sourceUnits[0].context);
  }

  getNewContract(): SourceUnit {
    const contractVars = this.variables.map((v) =>
      serializeVariable(v, this.factory)
    );

    const contractConstructor = new Constructor([]);

    const contractWriteFuncs = this.variables.map((v) => {
      return new SimpleWrite(v);
    });
    const contractReadFuncs = this.variables.map((v) => {
      return new ReadFunction(v);
    });

    const existingConstructor = this.contractUnit.children.findIndex((c) =>
      isConstructor(c)
    );
    this.contractUnit[existingConstructor] = contractConstructor.render(
      this.factory
    );

    contractVars.forEach((v) => this.contractUnit.appendChild(v));
    contractReadFuncs.forEach((v) =>
      this.contractUnit.appendChild(v.render(this.factory))
    );
    contractWriteFuncs.forEach((v) =>
      this.contractUnit.appendChild(v.render(this.factory))
    );
    return this.sourceUnits[0];
  }

  write(): string {
    const formatter = new PrettyFormatter(4, 0);
    const writer = new ASTWriter(
      DefaultASTWriterMapping,
      formatter,
      this.version
    );
    return writer.write(this.getNewContract());
  }
}
