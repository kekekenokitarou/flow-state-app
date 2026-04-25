import crypto from "crypto";
import { APPLE_MUSIC_TOKEN_EXPIRY_SECONDS } from "@/constants/app";

function base64url(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Convert DER-encoded ECDSA signature to IEEE P1363 (raw r||s) required for ES256
function derToP1363(der: Buffer): Buffer {
  let offset = 2; // skip 0x30 and total length byte
  offset += 1; // skip 0x02 (r marker)
  const rLen = der[offset++];
  const r = der.subarray(offset, offset + rLen);
  offset += rLen;
  offset += 1; // skip 0x02 (s marker)
  const sLen = der[offset++];
  const s = der.subarray(offset, offset + sLen);
  return Buffer.concat([normalize32(r), normalize32(s)]);
}

function normalize32(buf: Buffer): Buffer {
  if (buf.length === 32) return buf;
  if (buf.length > 32) return buf.subarray(buf.length - 32);
  const out = Buffer.alloc(32, 0);
  buf.copy(out, 32 - buf.length);
  return out;
}

export function generateAppleMusicToken(): string {
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  const rawKey = process.env.APPLE_MUSIC_PRIVATE_KEY;

  if (!teamId || !keyId || !rawKey) {
    throw new Error(
      "環境変数 APPLE_MUSIC_TEAM_ID / APPLE_MUSIC_KEY_ID / APPLE_MUSIC_PRIVATE_KEY が未設定です"
    );
  }

  const pemKey = rawKey.replace(/\\n/g, "\n");
  const header = base64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    JSON.stringify({ iss: teamId, iat: now, exp: now + APPLE_MUSIC_TOKEN_EXPIRY_SECONDS })
  );

  const signingInput = `${header}.${payload}`;
  const signer = crypto.createSign("SHA256");
  signer.update(signingInput);
  const derSig = signer.sign({ key: pemKey });
  const signature = base64url(derToP1363(derSig));

  return `${signingInput}.${signature}`;
}
