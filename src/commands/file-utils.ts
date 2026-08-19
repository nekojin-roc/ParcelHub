import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export type FileDigest = {
  path: string;
  bytes: number;
  sha256: string;
};

export async function fileSha256(filename: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filename)) hash.update(chunk);
  return hash.digest("hex");
}

export async function listFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  async function visit(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const filename = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(filename);
      else if (entry.isFile()) files.push(filename);
    }
  }
  await visit(directory);
  return files.sort();
}

export async function digestFile(
  filename: string,
  relativeTo: string
): Promise<FileDigest> {
  const metadata = await stat(filename);
  return {
    path: path.relative(relativeTo, filename),
    bytes: metadata.size,
    sha256: await fileSha256(filename),
  };
}
