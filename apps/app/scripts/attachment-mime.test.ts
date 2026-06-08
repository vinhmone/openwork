import { describe, expect, test } from "bun:test";

import type { ComposerAttachment } from "../src/app/types";
import { attachmentMime } from "../src/app/lib/attachment-mime";

function attachment(overrides: Partial<ComposerAttachment>): ComposerAttachment {
  return {
    id: "att_1",
    name: "file",
    mimeType: "application/octet-stream",
    size: 0,
    kind: "file",
    file: new File([], overrides.name ?? "file"),
    ...overrides,
  };
}

describe("attachmentMime", () => {
  test("coerces text-like extensions with empty/octet-stream MIME to text/plain", () => {
    expect(attachmentMime(attachment({ name: "notes.md", mimeType: "application/octet-stream" }))).toBe("text/plain");
    expect(attachmentMime(attachment({ name: "data.csv", mimeType: "" }))).toBe("text/plain");
    expect(attachmentMime(attachment({ name: "log.txt", mimeType: "application/octet-stream" }))).toBe("text/plain");
    expect(attachmentMime(attachment({ name: "config.yaml", mimeType: "" }))).toBe("text/plain");
    expect(attachmentMime(attachment({ name: "index.html", mimeType: "application/octet-stream" }))).toBe("text/plain");
  });

  test("keeps image MIME as-is", () => {
    expect(attachmentMime(attachment({ name: "photo.png", mimeType: "image/png", kind: "image" }))).toBe("image/png");
  });

  test("keeps pdf MIME as-is", () => {
    expect(attachmentMime(attachment({ name: "doc.pdf", mimeType: "application/pdf" }))).toBe("application/pdf");
  });

  test("maps text/* and application/json to text/plain", () => {
    expect(attachmentMime(attachment({ name: "readme", mimeType: "text/markdown" }))).toBe("text/plain");
    expect(attachmentMime(attachment({ name: "data.json", mimeType: "application/json" }))).toBe("text/plain");
  });

  test("keeps unknown binary attachments as-is", () => {
    expect(attachmentMime(attachment({ name: "archive.zip", mimeType: "application/octet-stream" }))).toBe("application/octet-stream");
    expect(attachmentMime(attachment({ name: "binary.bin", mimeType: "application/x-thing" }))).toBe("application/x-thing");
  });
});
