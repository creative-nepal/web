import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CtaBlock } from "../../types";

export function CtaBlockView({ block }: { block: CtaBlock }) {
  return (
    <section className="border-b bg-muted/40">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 px-6 py-14">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {block.heading}
        </h2>
        {block.body && (
          <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
            {block.body}
          </p>
        )}
        <Button
          render={<Link href={block.buttonHref} />}
          nativeButton={false}
          size="lg"
          className="mt-2"
        >
          {block.buttonLabel}
        </Button>
      </div>
    </section>
  );
}
