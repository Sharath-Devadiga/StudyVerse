import { Request, Response } from "express";
import { GOOGLE_CONFIG } from "../config/oauth";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@repo/db/prisma";
import { generateJwt } from "../utils/generateJwt";

export const googleAuth = (req: Request, res: Response) => {
  const action = (req.query.action as string) || "signin";

  const url = `${GOOGLE_CONFIG.auth_uri}?client_id=${
    GOOGLE_CONFIG.client_id
  }&redirect_uri=${
    GOOGLE_CONFIG.redirect_uri
  }&response_type=code&scope=${encodeURIComponent(
    GOOGLE_CONFIG.scope
  )}&access_type=offline&prompt=consent&state=${action}`;

  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const action = (req.query.state as string) || "signin";

  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    const { data } = await axios.post(
      GOOGLE_CONFIG.token_uri,
      {
        code,
        client_id: GOOGLE_CONFIG.client_id,
        client_secret: GOOGLE_CONFIG.client_secret,
        redirect_uri: GOOGLE_CONFIG.redirect_uri,
        grant_type: "authorization_code",
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const { id_token } = data;

    const client = new OAuth2Client(GOOGLE_CONFIG.client_id);
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CONFIG.client_id,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: "Invalid ID token" });

    const { sub, email, name, picture } = payload;

    const safeName: string = name ?? (email?.split("@")[0] ?? "Unknown");

    let user = await prisma.user.findUnique({
      where: { googleId: sub },
    });

    if (action === "signup") {
      if (user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/signin?error=user_exists`
        );
      }

      user = await prisma.user.create({
        data: {
          googleId: sub,
          email: email!,
          name: safeName,
          avatar: picture || null,
        },
      });
    } else {
      if (!user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/signup?error=user_not_found`
        );
      }
    }

    const token = generateJwt({ id: user.id, email: user.email });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
  } catch (e: any) {
    res.status(500).json({
      error: "Google authentication failed",
      details: e.message,
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    res.json(user);
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
