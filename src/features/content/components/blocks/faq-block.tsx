import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqBlock } from "../../types";

export function FaqBlockView({ block }: { block: FaqBlock }) {
  return (
    <section className="border-b">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-14">
        {block.heading && (
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {block.heading}
          </h2>
        )}
        <Accordion>
          {block.items.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
