import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

export const whitelist: string[] = [""];

export const getWhitelistProof = (address: string) => {
  const leafNodes = whitelist.map((a) => keccak256(a));
  const merkleTree = new MerkleTree(leafNodes, keccak256, {
    sortPairs: true,
  });

  const proof = merkleTree.getHexProof(keccak256(address));
  return proof;
};

export const getWhitelistRoot = () => {
  const leafNodes = whitelist.map((a) => keccak256(a));
  const merkleTree = new MerkleTree(leafNodes, keccak256, {
    sortPairs: true,
  });

  const root = merkleTree.getHexRoot();
  return root;
};
