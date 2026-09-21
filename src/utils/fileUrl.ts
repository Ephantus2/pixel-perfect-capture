import { API_URL } from "@/api/axios";

/**
 * Django returns media paths like "/course_materials/notes.ppt".
 * Prefix them with the API host so files can be opened and downloaded.
 */
export function fileUrl(file: unknown): string | null {
  if (file == null || file === "") return null;
  const value = String(file);
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_URL.replace(/\/$/, "")}/${value.replace(/^\//, "")}`;
}

/** Best-effort filename for the download attribute. */
export function fileName(file: unknown): string | undefined {
  const url = fileUrl(file);
  if (!url) return undefined;
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").filter(Boolean).pop() ?? "") || undefined;
  } catch {
    return undefined;
  }
}
