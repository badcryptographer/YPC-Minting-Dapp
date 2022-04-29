import Web3 from "web3";
import abi from "../../contracts/abi.json";
import config from "../../config";
import type { NextApiRequest, NextApiResponse } from "next";
import type { AbiItem } from "web3-utils";

export type ContractData = {
  totalSupply: number;
  maxSupply: number;
  isPaused: boolean;
  isWhitelistMintPaused: boolean;
  whitelistMintPrice: number;
  mintPrice: number;
};

export const fallbackData: ContractData = {
  totalSupply: 0,
  maxSupply: 10000,
  isWhitelistMintPaused: true,
  isPaused: true,
  whitelistMintPrice: 0.05,
  mintPrice: 0.1,
};

async function F(_req: NextApiRequest, res: NextApiResponse<ContractData>) {
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(config.providerUrl));
    const contract = new web3.eth.Contract(
      abi as unknown as AbiItem,
      config.contractAddress
    );

    const totalSupply = Number(await contract.methods.totalSupply().call());
    const maxSupply = Number(await contract.methods.MAX_SUPPLY().call());
    const isWhitelistMintPaused = Boolean(
      await contract.methods.isWhitelistMintPaused().call()
    );
    const isPaused = Boolean(await contract.methods.isPaused().call());
    const whitelistMintPrice = Number(
      await contract.methods.whitelistMintPrice().call()
    );
    const mintPrice = Number(await contract.methods.mintPrice().call());

    res.status(200).json({
      totalSupply,
      maxSupply,
      isWhitelistMintPaused,
      isPaused,
      whitelistMintPrice,
      mintPrice,
    });
  } catch (err) {
    console.log("Failed to fetch data from smart contract: ", err);
    res.status(200).json(fallbackData);
  }
}

export default F;
