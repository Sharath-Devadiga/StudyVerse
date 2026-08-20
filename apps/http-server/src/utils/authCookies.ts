import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const oauthStateCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "lax" : "lax",
  path: "/auth/google",
  maxAge: 10 * 60 * 1000,
};

export const clearAuthCookieOptions: CookieOptions = {
  ...authCookieOptions,
  expires: new Date(0),
  maxAge: 0,
};

export const clearOauthStateCookieOptions: CookieOptions = {
  ...oauthStateCookieOptions,
  expires: new Date(0),
  maxAge: 0,
};

export const adminCookieOptions: CookieOptions = {
  ...authCookieOptions,
  maxAge: 24 * 60 * 60 * 1000,
};

export const clearAdminCookieOptions: CookieOptions = {
  ...adminCookieOptions,
  expires: new Date(0),
  maxAge: 0,
};