export function logRouteError(
  error: Error & { digest?: string },
  scope: string,
) {
  console.error(`[web:${scope}]`, error);
}
