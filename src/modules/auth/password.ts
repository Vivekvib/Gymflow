import argon2 from "argon2";

/**
 * Argon2id is used (rather than bcrypt) because it is resistant to both
 * GPU-cracking and side-channel attacks, and is the current OWASP
 * recommendation for password storage. This module is the only place in
 * the app allowed to touch raw passwords.
 *
 * argon2 uses native bindings, so anything importing this file must run in
 * the Node.js runtime, never the Edge runtime. Route Handlers and Server
 * Actions default to Node.js, so this is safe to call from
 * modules/auth/actions.ts; it must never be imported from middleware.ts.
 */

const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MB, OWASP-recommended minimum for argon2id
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(plainTextPassword: string): Promise<string> {
  return argon2.hash(plainTextPassword, HASH_OPTIONS);
}

export async function verifyPassword(
  hash: string,
  plainTextPassword: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainTextPassword);
  } catch {
    // A malformed/legacy hash should fail closed, not throw past the caller.
    return false;
  }
}
