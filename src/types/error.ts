export interface RouteErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
  reset: () => void;
}
