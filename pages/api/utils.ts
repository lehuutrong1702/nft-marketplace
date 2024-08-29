import contract from "../../public/contracts/NftMarket.json"
import { withIronSession } from "next-iron-session";


const NETWORK_ID = "5777"

const targetNetwork = NETWORK_ID
export const contractAddress = contract["networks"][targetNetwork]["address"];

export function withSession(handler: any) {
    return withIronSession(handler , {
        password: process.env.SECRET_COOKIE_PASSWORD  as string,
        cookieName: "nft-auth-session",
        cookieOptions: {
            secure: process.env.NODE_ENV === "production" ? true : false
        }
    })
}