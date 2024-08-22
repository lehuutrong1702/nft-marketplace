
import { CryptoHookFactory } from "@_types/hooks";
import { Nft } from "@_types/nft";
import { ethers } from "ethers";
import useSWR from "swr";
import { useCallback } from "react";
type UseOwnedNftsResponse = {
  listNft: (token: number, price: number) => Promise<void>
}
type OwnedNftsHookFactory = CryptoHookFactory<Nft[], UseOwnedNftsResponse>

export type UseOwnedNftsHook = ReturnType<OwnedNftsHookFactory>

export const hookFactory: OwnedNftsHookFactory = ({contract}) => () => {
  const {data, ...swr} = useSWR(
    contract ? "web3/useListedNfts" : null,
    async () => {
      const nfts = [] as Nft[];
      const coreNfts = await contract!.getOwnedNfts() ;

      for (let i = 0 ; i < coreNfts.length ; i++){
        const item = coreNfts[i];
        const tokenUri =  await contract! .tokenURI(item.tokenId);
        const metaRes = await fetch(tokenUri);
        const meta = await metaRes.json();
      
        nfts.push({
          price: parseFloat(ethers.utils.formatEther(item.price)),
          tokenId: item.tokenId.toNumber(),
          creator: item.creator,
          isListed: item.isListed,
          meta
        })

      }


     
      return nfts;
    }
  )
  
  const _contract = contract ;
  const listNft = useCallback(async (token: number, price: number) => {
      try {
        const result = await _contract!.placeNftOnSale(
          token,  
          ethers.utils.parseEther(price.toString()), 
          {
            value: ethers.utils.parseEther(0.025.toString())
          }
        )
        await result?.wait();
        alert("Item has been listed")
      } catch (e: any) {
        console.error(e.message);
      }
   
  } ,[_contract])

  return {
    ...swr,
    data: data || [],
    listNft
  };
}