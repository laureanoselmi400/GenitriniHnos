import { createHash } from "crypto";
import { v2 as cloudinary } from "cloudinary";

const FOLDER = process.env.CLOUDINARY_FOLDER || "genitrini-hnos";

let ready = false;

function ensureConfig(): boolean {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) return false;
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  ready = true;
  return true;
}

export function cloudinaryEnabled(): boolean {
  return ready || ensureConfig();
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

/**
 * Firma una subida directa desde el navegador a Cloudinary.
 * Permite esquivar el límite de 4.5 MB de las funciones de Vercel.
 */
export function signUpload(): UploadSignature | null {
  if (!ensureConfig()) return null;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`folder=${FOLDER}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
    .digest("hex");
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    folder: FOLDER,
    timestamp,
    signature,
  };
}

export async function uploadImage(buffer: Buffer, mime: string): Promise<string> {
  if (!ensureConfig()) throw new Error("Cloudinary no está configurado.");
  const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: FOLDER,
    resource_type: "image",
  });
  return result.secure_url;
}

function publicIdFromUrl(url: string): string | null {
  const match = url.match(/\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match ? match[1] : null;
}

export async function deleteImage(url: string): Promise<void> {
  if (!isCloudinaryUrl(url) || !ensureConfig()) return;
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    /* ignoramos errores de borrado remoto */
  }
}
