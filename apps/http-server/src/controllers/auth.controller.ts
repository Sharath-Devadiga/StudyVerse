import { Request,Response } from "express";
import { GOOGLE_CONFIG } from "../config/oauth";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import {prisma} from "@repo/db/prisma"
import { generateJwt } from "../utils/generateJwt";

export const googleAuth = (req: Request,res: Response) => {
  const url = `${GOOGLE_CONFIG.auth_uri}?client_id=${GOOGLE_CONFIG.client_id}&redirect_uri=${GOOGLE_CONFIG.redirect_uri}&response_type=code&scope=${encodeURIComponent(GOOGLE_CONFIG.scope)}&access_type=offline&prompt=consent`;
  res.redirect(url);
}

export const googleCallback = async (req: Request,res:Response) => {
    const code = req.query.code as string;
    if(!code) return res.status(400).json({error: "No code provided"})

        try{
            const {data} = await axios.post(GOOGLE_CONFIG.token_uri,{
                code,
                client_id: GOOGLE_CONFIG.client_id,
                client_secret: GOOGLE_CONFIG.client_secret,
                redirect_uri: GOOGLE_CONFIG.redirect_uri,
                grant_type: "authorization_code"
            },{
                headers: {"Content-Type": "application/json"}
            });

            const {id_token} = data;

            const client = new OAuth2Client(GOOGLE_CONFIG.client_id);
                const ticket = await client.verifyIdToken({
                idToken: id_token,
                audience: GOOGLE_CONFIG.client_id
            });

            const payload = ticket.getPayload();
            if (!payload) return res.status(400).json({ error: "Invalid ID token" });

            const { sub, email, name, picture } = payload;


            let user = await prisma.user.findUnique({ where: { googleId: sub } });
            
            if(!user){
                user = await prisma.user.create({
                    data: {
                        googleId: sub,
                        email: email!,
                        name: name || "No name",
                        avatar: picture || null
                    }
                })
            }

            const token = generateJwt({ id: user.id, email: user.email });
            
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax"
                });

            res.redirect(`${process.env.FRONTEND_URL}/auth/success`);


        } catch(e){
             console.error(e);
                res.status(500).json({ error: "Google authentication failed" });
            }
}
