import type { MultipartFile } from "@fastify/multipart";
import { createReadStream, createWriteStream } from "node:fs";
import { access, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { randomUUID } from "node:crypto";

const MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const PHOTO_MIME_TYPES = new Set(Object.keys(MIME_TYPES));
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export class PackagePhotoError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

export function packagePhotoDirectory(): string {
  return path.resolve(process.env.UPLOAD_DIR ?? "uploads", "packages");
}

async function ensurePhotoDirectory(): Promise<string> {
  const directory = packagePhotoDirectory();
  await mkdir(directory, { recursive: true });
  return directory;
}

export async function storePackagePhoto(
  packageId: string,
  file: MultipartFile
): Promise<string> {
  if (!PHOTO_MIME_TYPES.has(file.mimetype)) {
    file.file.resume();
    throw new PackagePhotoError(
      "Only JPEG, PNG, and WebP images can be uploaded",
      415
    );
  }

  const extension = MIME_TYPES[file.mimetype as keyof typeof MIME_TYPES];
  const filename = `${packageId}-${randomUUID()}.${extension}`;
  const destination = path.join(await ensurePhotoDirectory(), filename);

  try {
    await pipeline(file.file, createWriteStream(destination, { flags: "wx" }));
    if (file.file.truncated) {
      await removePackagePhoto(filename);
      throw new PackagePhotoError(
        "Photo must be 5 MB or smaller",
        413
      );
    }
    return filename;
  } catch (error) {
    await removePackagePhoto(filename);
    if (error instanceof PackagePhotoError) throw error;
    throw new PackagePhotoError("Unable to store the photo", 500);
  }
}

export async function removePackagePhoto(filename: string): Promise<void> {
  if (path.basename(filename) !== filename) return;

  try {
    await unlink(path.join(packagePhotoDirectory(), filename));
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export async function getPackagePhoto(filename: string): Promise<{
  stream: ReturnType<typeof createReadStream>;
  mimeType: string;
}> {
  if (path.basename(filename) !== filename) {
    throw new PackagePhotoError("Photo not found", 404);
  }

  const filePath = path.join(packagePhotoDirectory(), filename);
  try {
    await access(filePath);
  } catch {
    throw new PackagePhotoError("Photo not found", 404);
  }

  const extension = path.extname(filename).toLowerCase();
  const mimeType =
    extension === ".png"
      ? "image/png"
      : extension === ".webp"
        ? "image/webp"
        : "image/jpeg";

  return { stream: createReadStream(filePath), mimeType };
}
