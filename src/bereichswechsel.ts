import { el } from "./dom";

const BEREICHE = [
  { pfad: "bibliothek", name: "Übungen", icon: "M3 4h7v7H3z M14 4h7v7h-7z M3 15h7v7H3z M14 15h7v7h-7z" },
  { pfad: "aufbau", name: "Aufbau", icon: "M4 5h16 M4 12h16 M4 19h16 M8 3v4 M16 10v4 M11 17v4" },
  { pfad: "generator", name: "Plan", icon: "M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z M19 18l.6 1.4L21 20l-1.4.6L19 22l-.6-1.4L17 20l1.4-.6z" },
] as const;

function symbol(pfad: string): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pfad);
  svg.append(path);
  return svg;
}

/** Die drei Arbeitsbereiche bleiben auf jeder Ansicht direkt erreichbar. */
export function bereichswechsel(): { element: HTMLElement; markieren: (pfad: string) => void } {
  const navigation = el("nav", { class: "bereichswechsel", "aria-label": "Bereiche" });
  const links = new Map<string, HTMLAnchorElement>();
  for (const bereich of BEREICHE) {
    const link = el("a", { href: `#/${bereich.pfad}` }, [
      symbol(bereich.icon),
      el("span", {}, [bereich.name]),
    ]);
    navigation.append(link);
    links.set(bereich.pfad, link);
  }
  return {
    element: navigation,
    markieren(pfad) {
      for (const [ziel, link] of links) {
        if (pfad === ziel) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
    },
  };
}
