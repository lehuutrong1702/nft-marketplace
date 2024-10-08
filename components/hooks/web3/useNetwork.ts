import { CryptoHookFactory } from "@_types/hooks";

import useSWR from "swr";




const NETWORKS: {[k: string]: string} = {
    1: "Ethereum Main Network",
    3: "Ropsten Test Network",
    4: "Rinkeby Test Network",
    5: "Goerli Test Network",
    42: "Kovan Test Network",
    56: "Binance Smart Chain",
    1337: "Ganache",
  }
  const targetId = process.env.NEXT_PUBLIC_TARGET_CHAIN_ID as string;
  const targetNetwork = NETWORKS[targetId];


  type UseNetworkResponse= {

    isLoading : boolean | undefined;
    isSupported: boolean;
    targetNetwork: string;
}

type NetworkHookFactory = CryptoHookFactory<string,UseNetworkResponse>
export type UseNetworkHook = ReturnType<NetworkHookFactory>

export const hookFactory: NetworkHookFactory = ({provider, isLoading}) => () => {
    const {data, isValidating, ...swr} = useSWR(
      provider ? "web3/useNetwork" : null,
      async () => {
        const chainId = (await provider?.getNetwork())?.chainId;
        if(!chainId) {
            throw ("Cannot retrive network")

        }
        return NETWORKS[chainId];
      }, {
        revalidateOnFocus: false
      }
    )
    

    return {
      ...swr,
      data,
      isValidating,
      isLoading: isLoading as boolean,
      targetNetwork,
      isSupported : targetNetwork === data
    };
  }


