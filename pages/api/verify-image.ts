import { NextApiRequest, NextApiResponse } from "next";
import { addressCheckMiddleware, pinataApiKey, pinataSecretApiKey, withSession } from "./utils";
import { Session } from "next-iron-session";
import { fileReq } from "@_types/nft";
import FormData from "form-data";
import axios from "axios";
import {v4 as uuidv4} from "uuid"

export default withSession(async (req: NextApiRequest & { session: Session }, res: NextApiResponse) => {
    if (req.method === "POST") {
        const {
            bytes,
            contentType,
            fileName
        } = req.body as fileReq;
        if (!bytes || !contentType || !fileName) {
            res.status(422).json({ message: "image data is missing" })
        }


        await addressCheckMiddleware(req, res);
        const buffer = Buffer.from(Object.values(bytes));
        const formData = new FormData();

        formData.append(
            "file",
            buffer,
            {
                contentType,
                filename: fileName + "-" + uuidv4()
            }
        )



        const fileRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: Infinity,
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }

        })

        return res.status(200).send(fileRes.data);

    } else {
        res.status(422).json({ message: "method is not valid" })
    }
})
