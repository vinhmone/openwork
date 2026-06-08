import type { ComposerAttachment } from "@/app/types";

// Mirror of the server allowlist in `isSupportedWorkspaceTextFilePath`
// (apps/server/src/server.ts). The OS often reports an empty `File.type`
// for these, which falls back to `application/octet-stream` and gets
// rejected by the model provider. Coerce them to `text/plain` instead.
export const TEXT_FILE_EXTENSIONS = new Set<string>([
  ".md",
  ".mdx",
  ".markdown",
  ".csv",
  ".tsv",
  ".json",
  ".jsonc",
  ".yaml",
  ".yml",
  ".toml",
  ".xml",
  ".html",
  ".htm",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".scss",
  ".txt",
  ".log",
]);

function extname(name: string): string {
  const clean = name.split(/[?#]/)[0] ?? name;
  const base = clean.split(/[/\\]/).pop() ?? clean;
  const index = base.lastIndexOf(".");
  return index >= 0 ? base.slice(index).toLowerCase() : "";
}

export function attachmentMime(attachment: ComposerAttachment): string {
  if (attachment.kind === "image") return attachment.mimeType;
  if (attachment.mimeType === "application/pdf") return attachment.mimeType;
  if (attachment.mimeType === "application/json") return "text/plain";
  if (attachment.mimeType.startsWith("text/")) return "text/plain";
  if (TEXT_FILE_EXTENSIONS.has(extname(attachment.name))) return "text/plain";
  return attachment.mimeType;
}

export function fileToDataUrl(file: File, mimeType: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read attachment: ${file.name}`));
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(new Blob([file], { type: mimeType }));
  });
}
