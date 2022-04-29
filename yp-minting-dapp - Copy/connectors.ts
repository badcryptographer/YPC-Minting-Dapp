import { InjectedConnector } from "@web3-react/injected-connector";

export const injected = new InjectedConnector({
  supportedChainIds: process.env.NODE_ENV === "production" ? [1] : [1],
});
