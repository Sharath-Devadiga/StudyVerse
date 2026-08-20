import { Request, Response } from "express";
import { GOOGLE_CONFIG } from "../config/oauth";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@repo/db/prisma";
import { generateJwt } from "../utils/generateJwt";
import { safeUserSelect } from "../utils/safeUser";
import { randomBytes, timingSafeEqual } from "crypto";
import {
  authCookieOptions,
  clearAuthCookieOptions,
  clearOauthStateCookieOptions,
  oauthStateCookieOptions,
} from "../utils/authCookies";

const frontendUrl = () => process.env.FRONTEND_URL || "http://localhost:3000";
const oauthStateCookie = "oauth_state";
const oauthActionCookie = "oauth_action";

export const googleAuth = (req: Request, res: Response) => {
  const requestedAction = req.query.action as string;
  const action = requestedAction === "signup" ? "signup" : "signin";
  const state = randomBytes(32).toString("hex");

  res.cookie(oauthStateCookie, state, oauthStateCookieOptions);
  res.cookie(oauthActionCookie, action, oauthStateCookieOptions);

  const url = `${GOOGLE_CONFIG.auth_uri}?client_id=${
    GOOGLE_CONFIG.client_id
  }&redirect_uri=${
    GOOGLE_CONFIG.redirect_uri
  }&response_type=code&scope=${encodeURIComponent(
    GOOGLE_CONFIG.scope
  )}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;

  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const storedState = req.cookies[oauthStateCookie] as string | undefined;
  const action = req.cookies[oauthActionCookie] === "signup" ? "signup" : "signin";

  if (!code) return res.status(400).json({ error: "No code provided" });
  if (
    !state ||
    !storedState ||
    state.length !== storedState.length ||
    !timingSafeEqual(Buffer.from(state), Buffer.from(storedState))
  ) {
    return res.status(400).json({ error: "Invalid OAuth state" });
  }

  res.clearCookie(oauthStateCookie, clearOauthStateCookieOptions);
  res.clearCookie(oauthActionCookie, clearOauthStateCookieOptions);

  try {
    const params = new URLSearchParams({
      code,
      client_id: GOOGLE_CONFIG.client_id,
      client_secret: GOOGLE_CONFIG.client_secret,
      redirect_uri: GOOGLE_CONFIG.redirect_uri,
      grant_type: "authorization_code",
    });

    const { data } = await axios.post(
      GOOGLE_CONFIG.token_uri,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
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

    const { sub, email, email_verified: emailVerified, name, picture } = payload;
    if (!sub || !email || emailVerified !== true) {
      return res.status(400).json({ error: "Google account verification failed" });
    }
    const safeName: string = name ?? (email?.split("@")[0] ?? "Unknown");

    let user = await prisma.user.findUnique({
      where: { googleId: sub },
    });

    if (action === "signup") {
      if (user) {
        return res.redirect(`${frontendUrl()}/login?error=user_exists`);
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
        return res.redirect(`${frontendUrl()}/signup?error=user_not_found`);
      }
    }

    const token = generateJwt({ id: user.id, email: user.email });

    res.cookie("token", token, authCookieOptions);
    res.redirect(`${frontendUrl()}/success?action=${action}`);
  } catch (e) {
    console.error("Google OAuth error");
    res.status(500).json({ error: "Google authentication failed" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const authUser = (req as Request & { user: { id: string } }).user;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: safeUserSelect,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const getSocketToken = (req: Request, res: Response) => {
  const authUser = (req as Request & { user: { id: string; email: string } }).user;
  const token = generateJwt(
    {
      id: authUser.id,
      email: authUser.email,
      purpose: "socket",
      aud: "studyverse-ws",
    },
    "60s"
  );
  res.json({ token });
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token", clearAuthCookieOptions);
  res.json({ message: "Logged out successfully" });
};
