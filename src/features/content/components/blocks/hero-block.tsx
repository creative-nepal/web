import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { HeroBlock } from "../../types";

export function HeroBlockView({ block }: { block: HeroBlock }) {
  return (
    <section className="border-b">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 px-6 py-16">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {block.heading}
        </h1>
        {block.subheading && (
          <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
            {block.subheading}
          </p>
        )}
        {(block.ctaLabel || block.secondaryCtaLabel) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {block.ctaLabel && block.ctaHref && (
              <Button
                render={<Link href={block.ctaHref} />}
                nativeButton={false}
                size="lg"
              >
                {block.ctaLabel}
              </Button>
            )}
            {block.secondaryCtaLabel && block.secondaryCtaHref && (
              <Button
                render={<Link href={block.secondaryCtaHref} />}
                nativeButton={false}
                variant="outline"
                size="lg"
              >
                {block.secondaryCtaLabel}
              </Button>
            )}
          </div>
        )}
        {block.imageUrl && (
          // biome-ignore lint/performance/noImgElement: CMS images are arbitrary remote URLs, not build-time assets
          <img
            src={block.imageUrl}
            alt=""
            className="mt-6 w-full max-w-full border"
          />
        )}
      </div>
    </section>
  );
}
