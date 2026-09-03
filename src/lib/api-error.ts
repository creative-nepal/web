export function apiErrorMessage(error: unknown, fallback = ""): string {
  const message = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message ?? fallback;
}
