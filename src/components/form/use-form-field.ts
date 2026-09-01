import { useFormContext } from "react-hook-form";

export function useFormField(name: string) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name] as { message?: string } | undefined;

  return { control, error };
}
