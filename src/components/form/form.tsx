"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type * as React from "react";
import {
  type DefaultValues,
  type FieldValues,
  FormProvider,
  type Resolver,
  type SubmitHandler,
  useForm,
} from "react-hook-form";

export {
  type Control,
  type FieldArrayWithId,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";

import type { z } from "zod";

interface FormProps<TFieldValues extends FieldValues>
  extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  schema: z.ZodType<TFieldValues, FieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
}

function Form<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  ...props
}: FormProps<TFieldValues>) {
  const methods = useForm<TFieldValues>({
    resolver: zodResolver(schema) as Resolver<TFieldValues>,
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form
        data-slot="form"
        onSubmit={methods.handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

export { Form };
