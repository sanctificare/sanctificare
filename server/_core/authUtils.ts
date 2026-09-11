import crypto from "crypto";
import util from "util";

const pbkdf2Async = util.promisify(crypto.pbkdf2);
const PBKDF2_ITERATIONS = 210000;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await pbkdf2Async(password, salt, PBKDF2_ITERATIONS, 64, "sha512");
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const verifyHash = await pbkdf2Async(password, salt, PBKDF2_ITERATIONS, 64, "sha512");

  const expected = Buffer.from(hash, "hex");
  const actual = Buffer.from(verifyHash.toString("hex"), "hex");
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

