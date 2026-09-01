import type { CatalogueNode, Translate, TranslateVars } from "./types";

function resolve(
  catalogue: Record<string, CatalogueNode> | undefined,
  key: string,
): string | null {
  let node: CatalogueNode | undefined = catalogue;

  for (const part of key.split(".")) {
    if (!node || typeof node === "string") {
      return null;
    }

    node = node[part];
  }

  return typeof node === "string" ? node : null;
}

function interpolate(template: string, vars: TranslateVars): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function createTranslate(
  namespaces: Record<string, CatalogueNode>,
): Translate {
  return (key, vars) =>
    interpolate(resolve(namespaces, key) ?? key, vars ?? {});
}
