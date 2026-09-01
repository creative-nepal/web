import type { ContentBlock } from "../types";
import { CtaBlockView } from "./blocks/cta-block";
import { FaqBlockView } from "./blocks/faq-block";
import { FeaturesBlockView } from "./blocks/features-block";
import { HeroBlockView } from "./blocks/hero-block";
import { RichTextBlockView } from "./blocks/rich-text-block";

function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case "hero":
      return <HeroBlockView key={block.id} block={block} />;
    case "features":
      return <FeaturesBlockView key={block.id} block={block} />;
    case "richText":
      return <RichTextBlockView key={block.id} block={block} />;
    case "faq":
      return <FaqBlockView key={block.id} block={block} />;
    case "cta":
      return <CtaBlockView key={block.id} block={block} />;
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return <>{blocks.map(renderBlock)}</>;
}
