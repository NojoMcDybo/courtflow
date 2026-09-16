export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  kinder: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) setAttribut(node, k, v);
  for (const kind of kinder) node.append(typeof kind === "string" ? (attrs.translate === "no" ? document.createTextNode(kind) : sprachText(kind)) : kind);
  return node;
}
import { setAttribut, sprachText } from "./i18n";
