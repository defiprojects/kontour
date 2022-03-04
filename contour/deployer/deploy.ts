import { ethWeb3, polygonWeb3, account } from "./web3";
import { compileSol, compileSourceString } from "solc-typed-ast";
import SimpleStorage from "../templates/SimpleStorage";
import { exec } from "child_process";
import fs from "fs";
import { Account } from "web3-core";
import { ContractType } from "../templates/types";

const TEMP_FILE = "temp.sol";
const TEMP_JSON = (name: string) => {
  return `temp_sol_${name}.abi`;
};
const TEMP_BIN = (name: string) => {
  return `temp_sol_${name}.bin`;
};

export interface DeployResult {
  address: string;
  abi: any;
}

export async function deploy(contract: ContractType): Promise<DeployResult> {
  try {
    fs.writeFileSync(`${__dirname}/${TEMP_FILE}`, contract.write());
    await new Promise((resolve, reject) => {
      exec(
        `solcjs -o ${__dirname}/../abis ${__dirname}/${TEMP_FILE} --bin --abi`,
        async (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            reject(false);
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            reject(false);
          }
          console.log(`stdout: ${stdout}`);
          resolve(true);
        }
      );
    });
    let abi = JSON.parse(
      fs
        .readFileSync(`${__dirname}/../abis/${TEMP_JSON(contract.name)}`)
        .toString()
    );
    let code = fs
      .readFileSync(`${__dirname}/../abis/${TEMP_BIN(contract.name)}`)
      .toString();
    let Contract = new polygonWeb3.eth.Contract(abi);
    const transaction = Contract.deploy({ data: code });

    const result = await sendTxAndLog(transaction, account);
    console.log("result", result);

    return {
      address: result.contractAddress,
      abi: abi,
    };
  } catch (e) {
    console.log("err", e);
  }
}

export async function sendTxAndLog(transaction: any, account: Account) {
  console.log("sending from", account.address);
  const gasPrice = await polygonWeb3.eth.getGasPrice();
  console.log("gas", gasPrice);
  const g = await transaction.estimateGas({ from: account.address });
  console.log("gas2", g);
  const tx = {
    from: account.address,
    to: transaction._parent._address,
    gas: await transaction.estimateGas({
      from: account.address,
      gasPrice: gasPrice,
    }),
    gasPrice: gasPrice,
    data: transaction.encodeABI(),
  };

  const signed = await polygonWeb3.eth.accounts.signTransaction(
    tx,
    account.privateKey
  );
  const result = await polygonWeb3.eth.sendSignedTransaction(
    signed.rawTransaction
  );
  return result;
}
