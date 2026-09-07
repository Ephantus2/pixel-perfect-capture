import axios from "axios";

export type FieldErrors = Record<string, string>;

export interface ParsedApiError {
  message: string;
  status?: number;
  fieldErrors: FieldErrors;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Please check the information you entered and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have permission to perform this action.",
  404: "Requested resource was not found.",
  409: "This action conflicts with existing data.",
  422: "Some of the submitted data could not be processed.",
  500: "The Django server encountered an internal error.",
};

function humanizeField(field: string) {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function flatten(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (typeof value === "object") return Object.values(value as object).flatMap(flatten);
  return [String(value)];
}

/** Converts a Django REST Framework error payload into readable messages. */
export function parseApiError(error: unknown): ParsedApiError {
  const fieldErrors: FieldErrors = {};

  if (!axios.isAxiosError(error)) {
    return { message: "An unexpected error occurred.", fieldErrors };
  }

  if (error.code === "ECONNABORTED") {
    return {
      message: "The request timed out. The Django server took too long to respond.",
      fieldErrors,
    };
  }

  if (!error.response) {
    return {
      message: "Unable to connect to the Django server. Make sure the backend is running.",
      fieldErrors,
    };
  }

  const status = error.response.status;
  const data = error.response.data as unknown;
  const messages: string[] = [];

  if (typeof data === "string" && data && !data.startsWith("<")) {
    messages.push(data);
  } else if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const parts = flatten(value);
      if (!parts.length) continue;
      const text = parts.join(" ");
      if (["detail", "message", "error", "Error", "non_field_errors"].includes(key)) {
        messages.push(text);
      } else {
        fieldErrors[key] = text;
        messages.push(`${humanizeField(key)}: ${text}`);
      }
    }
  }

  const message = messages.length
    ? messages.join(" ")
    : (STATUS_MESSAGES[status] ?? `Request failed with status ${status}.`);

  return { message, status, fieldErrors };
}

export function apiErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}
