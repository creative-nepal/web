import Markdown from "react-markdown";
import type { RichTextBlock } from "../../types";

export function RichTextBlockView({ block }: { block: RichTextBlock }) {
  return (
    <section className="border-b">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-14">
        {block.heading && (
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {block.heading}
          </h2>
        )}
        <div className="flex flex-col gap-3 text-sm/relaxed [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-heading [&_h3]:text-sm [&_h3]:font-medium [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:font-medium">
          <Markdown>{block.markdown}</Markdown>
        </div>
      </div>
    </section>
  );
}
