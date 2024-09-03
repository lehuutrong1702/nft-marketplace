
import { NftMeta } from "@_types/nft"
import { contractAddress, withSession, addressCheckMiddleware, pinataApiKey, pinataSecretApiKey } from "./utils"
import { NextApiRequest,NextApiResponse } from "next"
import { Session } from "next-iron-session"
import {v4 as uuidv4} from "uuid"
import axios from "axios"


export default withSession (async (req: NextApiRequest & {session: Session}, res:NextApiResponse) => {

    if(req.method ==="POST") {
        try {
            const body = req.body;
            const nft = body.nft as NftMeta
            if ( !nft.attributes || !nft.description|| !nft.name){
                return res.status(422).send({message: "Some of the form data are missing!"});
            }

            await addressCheckMiddleware(req, res);
            const jsonRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                pinataMetadata: {
                  name: uuidv4()
                },
                pinataContent: nft
              }, {
                headers: {
                  pinata_api_key: pinataApiKey,
                  pinata_secret_api_key: pinataSecretApiKey
                }
              });
        
              return res.status(200).send(jsonRes.data);
        }catch (e : any){
            console.log(e);
            return res.status(422).send({message:"can not create JSON"})
        }
    }
     else if (req.method === "GET") {
        try {
            const message = { contractAddress, id:uuidv4()};
            req.session.set("message-session",message);
            await req.session.save();
            return res.json(message);
        }catch {
            return res.status(422).send("cannot generate message");
        }
    } else {
        return res.status(200).json({message:"invalid api route"})
    }

})