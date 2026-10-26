import { pbkdf2, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const derive = promisify(scrypt);
const legacyDerive = promisify(pbkdf2);
export async function hashPassword(password: string) {
  const salt = randomBytes(32).toString("hex");
  const key = (await derive(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${key.toString("hex")}`;
}
export async function verifyPassword(
  password: string,
  user: { passwordHash?: string; salt?: string; hash?: string },
) {
  if (user.passwordHash) {
    const [algorithm, salt, hash] = user.passwordHash.split("$");
    if (
      algorithm !== "scrypt" ||
      !salt ||
      !hash ||
      !/^[a-f\d]{128}$/i.test(hash)
    )
      return false;
    const actual = (await derive(password, salt, 64)) as Buffer;
    return timingSafeEqual(actual, Buffer.from(hash, "hex"));
  }
  if (!user.salt || !user.hash || !/^[a-f\d]{1024}$/i.test(user.hash))
    return false;
  // passport-local-mongoose 8 defaults, verified against the legacy installation.
  const actual = await legacyDerive(password, user.salt, 25000, 512, "sha256");
  return timingSafeEqual(actual, Buffer.from(user.hash, "hex"));
}
