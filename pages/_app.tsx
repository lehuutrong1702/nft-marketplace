
import Web3Provider from "@provider/web3";
import { Navbar } from "../components/ui";
import '../styles/globals.css'
import type { AppProps } from "next/app";


export default function App({ Component, pageProps }: AppProps) {
  return (
  <>
    <Web3Provider>
      <Component {...pageProps} />;
    </Web3Provider>
  </>
  )



}
