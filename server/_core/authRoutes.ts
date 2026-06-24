import { Router } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import { getCsrfCookieOptions, getSessionCookieOptions } from "./cookies";
import { CSRF_COOKIE_NAME, generateCsrfToken, isDevAuthBypassEnabled } from "./security";
import { ENV } from "./env";
import { sdk } from "./sdk";
import { hashPassword, comparePassword } from "./authUtils";
import { sendPasswordResetEmail } from "./email";
import { nanoid } from "nanoid";
import { parse as parseCookie } from "cookie";
import {
  getUserByEmail,
  createUser,
  createPasswordResetToken,
  validatePasswordResetToken,
  consumePasswordResetToken,
} from "../db";

const router = Router();

// Middleware to inject user
export async function injectUserMiddleware(req: any, res: any, next: any) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(req);
  } catch (error) {
    user = null;
  }

  const cookies = req.headers.cookie ? parseCookie(req.headers.cookie) : {};
  const isDevLoggedOut = cookies["dev_logged_out"] === "1";

  if (!user && !isDevLoggedOut && isDevAuthBypassEnabled(req)) {
    user = {
      id: 1,
      openId: "dev-local-user",
      name: "Fiel (Dev)",
      email: "dev@sanctificare.local",
      loginMethod: "dev",
      role: "admin",
      templatePreference: "classico" as const,
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
  }

  req.user = user;
  next();
}

router.get("/me", injectUserMiddleware, (req: any, res) => {
  res.json(req.user || null);
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || name.length < 2) {
      return res.status(400).json({ error: "O nome deve ter pelo menos 2 caracteres" });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: "E-mail inválido" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Este e-mail já está cadastrado." });
    }

    const passwordHash = hashPassword(password);
    const newUser = await createUser({
      openId: email,
      email,
      name,
      passwordHash,
      loginMethod: "credentials",
      role: "user",
    });

    const token = await sdk.createSessionToken(newUser.openId, { name: newUser.name || "" });
    const cookieOptions = getSessionCookieOptions(req);
    const csrfCookieOptions = getCsrfCookieOptions(req);

    if (isDevAuthBypassEnabled(req)) {
      res.clearCookie("dev_logged_out", { ...cookieOptions, maxAge: -1 });
    }

    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ENV.sessionTtlMs });
    res.cookie(CSRF_COOKIE_NAME, generateCsrfToken(), {
      ...csrfCookieOptions,
      maxAge: ENV.sessionTtlMs,
    });

    return res.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error: any) {
    console.error("[Auth Register Error]", error);
    return res.status(500).json({ error: error.message || "Erro no servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }

    const user = await getUserByEmail(email);
    if (!user || !user.passwordHash || !comparePassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    const token = await sdk.createSessionToken(user.openId, { name: user.name || "" });
    const cookieOptions = getSessionCookieOptions(req);
    const csrfCookieOptions = getCsrfCookieOptions(req);

    if (isDevAuthBypassEnabled(req)) {
      res.clearCookie("dev_logged_out", { ...cookieOptions, maxAge: -1 });
    }

    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ENV.sessionTtlMs });
    res.cookie(CSRF_COOKIE_NAME, generateCsrfToken(), {
      ...csrfCookieOptions,
      maxAge: ENV.sessionTtlMs,
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("[Auth Login Error]", error);
    return res.status(500).json({ error: error.message || "Erro no servidor" });
  }
});

router.post("/logout", (req, res) => {
  try {
    const cookieOptions = getSessionCookieOptions(req);
    const csrfCookieOptions = getCsrfCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.clearCookie(CSRF_COOKIE_NAME, { ...csrfCookieOptions, maxAge: -1 });
    if (isDevAuthBypassEnabled(req)) {
      res.cookie("dev_logged_out", "1", { ...cookieOptions, maxAge: ONE_YEAR_MS });
    }
    return res.json({ success: true });
  } catch (error: any) {
    console.error("[Auth Logout Error]", error);
    return res.status(500).json({ error: error.message || "Erro no servidor" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "E-mail é obrigatório" });
    }

    const user = await getUserByEmail(email);

    if (user && user.id) {
      try {
        const token = nanoid(48);
        await createPasswordResetToken(user.id, token);

        const appUrl = process.env.APP_URL ?? "http://localhost:5173";
        const resetLink = `${appUrl}/redefinir-senha?token=${token}`;

        await sendPasswordResetEmail(
          user.email ?? email,
          user.name ?? "Fiel",
          resetLink
        );
      } catch (err) {
        console.error("[ForgotPassword] Email send error:", err);
      }
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error("[ForgotPassword Error]", error);
    return res.status(500).json({ error: error.message || "Erro no servidor" });
  }
});

router.get("/validate-reset-token", async (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).json({ error: "Token é obrigatório" });
    }
    const userId = await validatePasswordResetToken(token);
    return res.json({ valid: userId !== null });
  } catch (error: any) {
    console.error("[ValidateResetToken Error]", error);
    return res.status(500).json({ error: error.message || "Erro no servidor" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) {
      return res.status(400).json({ error: "Token e senha com pelo menos 6 caracteres são obrigatórios" });
    }

    const newHash = hashPassword(password);
    const ok = await consumePasswordResetToken(token, newHash);

    if (!ok) {
      return res.status(400).json({ error: "Link inválido ou expirado. Solicite um novo link de recuperação." });
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error("[ResetPassword Error]", error);
    return res.status(500).json({ error: error.message || "Erro no servidor" });
  }
});

export const authRouter = router;
