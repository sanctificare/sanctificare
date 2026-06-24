import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { parse as parseCookie } from "cookie";
import { isDevAuthBypassEnabled } from "./security";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

const DEV_BYPASS_USER: User = {
  id: 1,
  openId: "dev-local-user",
  name: "Fiel (Dev)",
  email: "dev@sanctificare.local",
  loginMethod: "dev",
  role: "admin",
  templatePreference: "classico",
  passwordHash: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Dev-only bypass: when no real auth is configured, surface a stub user
  // so the local UI is fully navigable without OAuth/DB.
  // Bypass if the developer explicitly logged out.
  const cookies = opts.req.headers.cookie ? parseCookie(opts.req.headers.cookie) : {};
  const isDevLoggedOut = cookies["dev_logged_out"] === "1";

  if (!user && !isDevLoggedOut && isDevAuthBypassEnabled(opts.req)) {
    user = DEV_BYPASS_USER;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
