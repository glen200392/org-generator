// Metadata encoding/decoding for embedding workbook state in exported files
// Extracted from index.html L1161-1175

import { METADATA_PREFIX } from "../model/types";
import type { SerializedPayload } from "../model/types";

/** Encode a payload object to a Base64 string with the OGMODELV2 prefix */
export function encodeMetadataPayload(payload: SerializedPayload): string {
  const jsonStr = JSON.stringify(payload);
  // Use TextEncoder for cross-platform UTF-8 encoding
  const bytes = new TextEncoder().encode(jsonStr);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return METADATA_PREFIX + btoa(binary);
}

/** Validate that a parsed object has the expected shape of a SerializedPayload */
function isValidPayload(obj: unknown): obj is SerializedPayload {
  if (obj === null || typeof obj !== "object") return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.version === "number" &&
    typeof p.exportedAt === "string" &&
    p.workbook !== null &&
    typeof p.workbook === "object" &&
    Array.isArray((p.workbook as Record<string, unknown>).nodesRows)
  );
}

/** Decode a prefixed Base64 string back to a payload object.
 *  Validates the parsed structure before returning (fix C2: untrusted input). */
export function decodeMetadataPayload(
  encoded: string,
): SerializedPayload | null {
  if (!encoded || !encoded.startsWith(METADATA_PREFIX)) return null;
  try {
    const base64 = encoded.slice(METADATA_PREFIX.length);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(jsonStr);
    if (!isValidPayload(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Extract a metadata payload from a text string (e.g., PPT notes) */
export function extractMetadataPayload(
  text: string,
): SerializedPayload | null {
  const match = text.match(/OGMODELV2:[A-Za-z0-9+/=]+/);
  return match ? decodeMetadataPayload(match[0]) : null;
}
