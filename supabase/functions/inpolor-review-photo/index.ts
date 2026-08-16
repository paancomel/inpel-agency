import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2.110.2";

const BUCKET = "inpolor-review-photos";
const MAX_BYTES = 5 * 1024 * 1024;
const CATEGORIES = new Set(["class", "library", "affordable_food", "daily_route", "campus", "accommodation", "hangout", "nearby_activity"]);
const MIME_EXTENSIONS = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
type JsonRecord = Record<string, unknown>;
type PhotoRow = { id: string; review_id: string; category: string; storage_path: string; redaction_status: string };

class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const response = (body: JsonRecord, status = 200) => Response.json(body, { status, headers: CORS });
const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
function concat(parts: Uint8Array[]) { const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0)); let offset = 0; for (const part of parts) { output.set(part, offset); offset += part.length; } return output; }
function readUint32(bytes: Uint8Array, offset: number, littleEndian = false) { return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, littleEndian); }
function detectedMime(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return "image/png";
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "image/webp";
  return null;
}
function ensureImage(bytes: Uint8Array, declaredMime?: string) {
  if (!bytes.length || bytes.length > MAX_BYTES) throw new HttpError(413, "Each photo must be no larger than 5MB.");
  const mime = detectedMime(bytes);
  if (!mime || !MIME_EXTENSIONS.has(mime) || (declaredMime && declaredMime !== mime)) throw new HttpError(415, "The file content must be JPEG, PNG, or WebP.");
  return mime;
}
function stripJpeg(bytes: Uint8Array) {
  const parts = [bytes.slice(0, 2)]; let position = 2;
  while (position < bytes.length) {
    const start = position;
    if (bytes[position++] !== 0xff) throw new HttpError(422, "The processed JPEG is malformed.");
    while (bytes[position] === 0xff) position++;
    const marker = bytes[position++];
    if (marker === 0xda) { parts.push(bytes.slice(start)); return concat(parts); }
    if (marker === 0xd9) { parts.push(bytes.slice(start, position)); return concat(parts); }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { parts.push(bytes.slice(start, position)); continue; }
    if (position + 2 > bytes.length) throw new HttpError(422, "The processed JPEG is truncated.");
    const length = (bytes[position] << 8) | bytes[position + 1]; const end = position + length;
    if (length < 2 || end > bytes.length) throw new HttpError(422, "The processed JPEG is truncated.");
    if (!((marker >= 0xe1 && marker <= 0xef) || marker === 0xfe)) parts.push(bytes.slice(start, end));
    position = end;
  }
  throw new HttpError(422, "The processed JPEG has no image data.");
}
function stripPng(bytes: Uint8Array) {
  const parts = [bytes.slice(0, 8)]; const remove = new Set(["eXIf", "tEXt", "zTXt", "iTXt", "tIME"]); let position = 8; let ended = false;
  while (position + 12 <= bytes.length) { const length = readUint32(bytes, position); const end = position + 12 + length; if (end > bytes.length) throw new HttpError(422, "The processed PNG is truncated."); const type = ascii(bytes, position + 4, position + 8); if (!remove.has(type)) parts.push(bytes.slice(position, end)); position = end; if (type === "IEND") { ended = true; break; } }
  if (!ended || position !== bytes.length) throw new HttpError(422, "The processed PNG is malformed."); return concat(parts);
}
function stripWebp(bytes: Uint8Array) {
  const chunks: Uint8Array[] = []; let position = 12;
  while (position + 8 <= bytes.length) { const length = readUint32(bytes, position + 4, true); const end = position + 8 + length + (length % 2); if (end > bytes.length) throw new HttpError(422, "The processed WebP is truncated."); const type = ascii(bytes, position, position + 4); if (!["EXIF", "XMP ", "ICCP"].includes(type)) { const chunk = bytes.slice(position, end); if (type === "VP8X" && length >= 1) chunk[8] &= ~0x2c; chunks.push(chunk); } position = end; }
  if (position !== bytes.length || !chunks.length) throw new HttpError(422, "The processed WebP is malformed."); const body = concat(chunks); const header = bytes.slice(0, 12); new DataView(header.buffer, header.byteOffset, header.byteLength).setUint32(4, body.length + 4, true); return concat([header, body]);
}
function stripMetadata(bytes: Uint8Array, mime: string) { if (mime === "image/jpeg") return stripJpeg(bytes); if (mime === "image/png") return stripPng(bytes); if (mime === "image/webp") return stripWebp(bytes); throw new HttpError(415, "Unsupported image."); }

function adminKey() {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keys) { try { const value = (JSON.parse(keys) as Record<string, string>).default; if (value) return value; } catch { /* fallback */ } }
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); if (!key) throw new HttpError(503, "Photo processing is not configured."); return key;
}
function createAdmin() { const url = Deno.env.get("SUPABASE_URL"); if (!url) throw new HttpError(503, "Photo processing is not configured."); return createClient(url, adminKey(), { auth: { persistSession: false, autoRefreshToken: false } }); }
async function authenticatedUser(req: Request, admin: SupabaseClient): Promise<User> { const value = req.headers.get("Authorization") ?? ""; const token = value.replace(/^Bearer\s+/i, ""); if (!token || token === value) throw new HttpError(401, "Sign in is required."); const { data, error } = await admin.auth.getUser(token); if (error || !data.user) throw new HttpError(401, "Your session is no longer valid."); return data.user; }
function uuid(value: unknown, label: string) { if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new HttpError(400, `${label} is invalid.`); return value; }
async function ownedDraft(admin: SupabaseClient, reviewId: string, userId: string) { const { data, error } = await admin.from("reviews").select("id,user_id,status,review_kind").eq("id", reviewId).maybeSingle(); if (error) throw new HttpError(500, "The review draft could not be checked."); if (!data || data.user_id !== userId || data.status !== "draft" || data.review_kind !== "reward") throw new HttpError(403, "A reward review draft owned by you is required."); }

async function redact(file: File, category: string) {
  const url = Deno.env.get("INPOLOR_REDACTION_API_URL"); const key = Deno.env.get("INPOLOR_REDACTION_API_KEY");
  if (!url || !key) throw new HttpError(503, "Photo safety processing is temporarily unavailable.");
  const body = new FormData(); body.set("image", file, file.name); body.set("category", category); body.set("requirements", "redact_faces_vehicle_plates_identity_documents_sensitive_text");
  let result: Response; try { result = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${key}` }, body, signal: AbortSignal.timeout(120_000) }); } catch { throw new HttpError(503, "Photo safety processing did not respond. Please try again."); }
  if (!result.ok || result.headers.get("x-inpolor-redaction-status") !== "passed") throw new HttpError(422, "This photo could not be made safe for publication.");
  const provider = result.headers.get("x-inpolor-redaction-provider")?.trim(); const version = result.headers.get("x-inpolor-redaction-version")?.trim();
  if (!provider || !version) throw new HttpError(502, "The safety service returned an unverifiable result.");
  const raw = new Uint8Array(await result.arrayBuffer()); const mime = ensureImage(raw, result.headers.get("content-type")?.split(";")[0]?.trim()); const bytes = stripMetadata(raw, mime); ensureImage(bytes, mime); return { bytes, mime, provider, version };
}
async function signedUrl(admin: SupabaseClient, path: string) { const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 600); if (error || !data?.signedUrl) throw new HttpError(500, "A safe preview could not be created."); return data.signedUrl; }

async function upload(req: Request, admin: SupabaseClient, user: User) {
  const form = await req.formData(); const reviewId = uuid(form.get("reviewId"), "Review"); const category = form.get("category"); const file = form.get("file");
  if (typeof category !== "string" || !CATEGORIES.has(category)) throw new HttpError(400, "Photo category is invalid."); if (!(file instanceof File)) throw new HttpError(400, "Choose a photo.");
  await ownedDraft(admin, reviewId, user.id); const originalBytes = new Uint8Array(await file.arrayBuffer()); const originalMime = ensureImage(originalBytes, file.type || undefined);
  const { count, error: countError } = await admin.from("review_photos").select("id", { count: "exact", head: true }).eq("review_id", reviewId).eq("category", category); if (countError) throw new HttpError(500, "Existing photos could not be checked."); if ((count ?? 0) >= 5) throw new HttpError(409, "A category can contain at most five photos.");
  const id = crypto.randomUUID(); const originalPath = `${user.id}/${reviewId}/originals/${id}.${MIME_EXTENSIONS.get(originalMime)}`; let originalStored = false; let safePath: string | null = null;
  try {
    const { error: originalError } = await admin.storage.from(BUCKET).upload(originalPath, originalBytes, { contentType: originalMime, upsert: false, cacheControl: "0" }); if (originalError) throw new HttpError(500, "The private upload could not be stored."); originalStored = true;
    const safe = await redact(new File([originalBytes], file.name, { type: originalMime }), category); safePath = `${user.id}/${reviewId}/safe/${id}.${MIME_EXTENSIONS.get(safe.mime)}`;
    const { error: safeError } = await admin.storage.from(BUCKET).upload(safePath, safe.bytes, { contentType: safe.mime, upsert: false, cacheControl: "3600" }); if (safeError) throw new HttpError(500, "The safe derivative could not be stored.");
    const { error: removeError } = await admin.storage.from(BUCKET).remove([originalPath]); if (removeError) { await admin.storage.from(BUCKET).remove([safePath]); throw new HttpError(500, "The private original could not be deleted; no photo was accepted."); } originalStored = false;
    const now = new Date().toISOString(); const { data, error } = await admin.from("review_photos").insert({ id, review_id: reviewId, category, storage_path: safePath, mime_type: safe.mime, size_bytes: safe.bytes.length, redaction_status: "redacted", status: "pending", processing_provider: safe.provider, processing_version: safe.version, metadata_stripped_at: now, original_deleted_at: now, safety_checked_at: now }).select("id,category,storage_path,redaction_status").single();
    if (error || !data) { await admin.storage.from(BUCKET).remove([safePath]); throw new HttpError(500, "The safe photo record could not be created."); }
    return response({ photo: { id: data.id, category: data.category, status: data.redaction_status, previewUrl: await signedUrl(admin, data.storage_path) } }, 201);
  } finally { if (originalStored) await admin.storage.from(BUCKET).remove([originalPath]); }
}
async function ownedPhoto(admin: SupabaseClient, photoId: string, userId: string): Promise<PhotoRow> { const { data, error } = await admin.from("review_photos").select("id,review_id,category,storage_path,redaction_status").eq("id", photoId).maybeSingle(); if (error || !data) throw new HttpError(404, "Photo not found."); await ownedDraft(admin, data.review_id, userId); return data as PhotoRow; }
async function action(req: Request, admin: SupabaseClient, user: User) {
  const body = await req.json() as JsonRecord; const photo = await ownedPhoto(admin, uuid(body.photoId, "Photo"), user.id);
  if (body.action === "preview") return response({ previewUrl: await signedUrl(admin, photo.storage_path) });
  if (body.action === "confirm") { if (!["redacted", "confirmed"].includes(photo.redaction_status)) throw new HttpError(409, "This photo is not ready for confirmation."); const { error } = await admin.from("review_photos").update({ redaction_status: "confirmed", redaction_confirmed_at: new Date().toISOString() }).eq("id", photo.id); if (error) throw new HttpError(500, "Photo confirmation failed."); return response({ photo: { id: photo.id, category: photo.category, status: "confirmed", previewUrl: await signedUrl(admin, photo.storage_path) } }); }
  if (body.action === "delete") { const { error: storageError } = await admin.storage.from(BUCKET).remove([photo.storage_path]); if (storageError) throw new HttpError(500, "The photo could not be removed safely."); const { error } = await admin.from("review_photos").delete().eq("id", photo.id); if (error) throw new HttpError(500, "The photo record could not be removed."); return response({ deleted: true }); }
  throw new HttpError(400, "Unsupported photo action.");
}
async function publicPreview(req: Request, admin: SupabaseClient) {
  const photoId = uuid(new URL(req.url).searchParams.get("id"), "Photo");
  const auth = req.headers.get("Authorization"); if (auth) { try { const user = await authenticatedUser(req, admin); const photo = await ownedPhoto(admin, photoId, user.id); return response({ previewUrl: await signedUrl(admin, photo.storage_path) }); } catch (error) { if (!(error instanceof HttpError) || ![401, 403, 404].includes(error.status)) throw error; } }
  const { data, error } = await admin.from("published_review_photos").select("storage_path").eq("id", photoId).eq("visibility_status", "published").maybeSingle(); if (error || !data) throw new HttpError(404, "Published photo not found."); return response({ previewUrl: await signedUrl(admin, data.storage_path) });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  try { const admin = createAdmin(); if (req.method === "GET") return await publicPreview(req, admin); if (req.method !== "POST") throw new HttpError(405, "Method not allowed."); const user = await authenticatedUser(req, admin); return (req.headers.get("content-type") ?? "").includes("multipart/form-data") ? await upload(req, admin, user) : await action(req, admin, user); }
  catch (error) { if (error instanceof HttpError) return response({ error: error.message }, error.status); console.error("inpolor-review-photo", error); return response({ error: "Photo processing failed safely. No image was accepted." }, 500); }
});
