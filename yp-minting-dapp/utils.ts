import axios from "axios";
import { UnsupportedChainIdError } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const fetchContractData = async () => {
  const result = await fetcher("/api/data");
  return result;
};

export const truncateContractAddress = (address: string) => {
  return (
    address.substring(0, 10) + "..." + address.substring(address.length - 10)
  );
};

export const getContractUrl = (address: string) => {
  return `https://etherscan.com/address/${address}`;
};

export const getTxUrl = (txId: string) => {
  return `https://etherscan.com/tx/${txId}`;
};

export function getErrorMessage(error: Error): string {
  if (error instanceof NoEthereumProviderError) {
    return "MetaMask browser extension not detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network. Please connect to the Ethereum mainnet to continue.";
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return "Please authorize this website to access your Metamask account.";
  } else {
    console.error(error);
    return "An unknown error occurred. Please check your Metamask extension and try again. If you need further help, please contact support via Discord or Twitter for assistance.";
  }
}
