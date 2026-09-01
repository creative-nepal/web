import { Spinner } from "@/components/ui/spinner";

export default function AuthLoading() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Spinner className="size-5 text-muted-foreground" />
    </div>
  );
}
