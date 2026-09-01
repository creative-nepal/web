import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FeaturesBlock } from "../../types";

export function FeaturesBlockView({ block }: { block: FeaturesBlock }) {
  return (
    <section className="border-b">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-14">
        {(block.heading || block.subheading) && (
          <div className="flex flex-col gap-2">
            {block.heading && (
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                {block.heading}
              </h2>
            )}
            {block.subheading && (
              <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
                {block.subheading}
              </p>
            )}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {block.items.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="text-xs/relaxed">
                  {item.body}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
