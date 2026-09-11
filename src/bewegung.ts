/** A saved source card that can survive its parent being redrawn. */
export interface Ursprung {
  rect: DOMRect;
  knoten: HTMLElement;
}

interface Flug {
  beendet: boolean;
  animationen: Set<Animation>;
  aufraeumen: () => void;
}

const FLUG_DAUER = 550;
const ANKUNFT_DAUER = 180;

function istAusserhalb(rect: DOMRect): boolean {
  return rect.right <= 0 || rect.bottom <= 0 || rect.left >= window.innerWidth || rect.top >= window.innerHeight;
}

function bevorzugtWenigerBewegung(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function istTransparent(farbe: string): boolean {
  return farbe === "transparent" || /^rgba\(0,\s*0,\s*0,\s*0\)$/.test(farbe);
}

function bereinigeKlon(knoten: HTMLElement, quelle: HTMLElement): void {
  knoten.removeAttribute("id");
  knoten.removeAttribute("name");
  for (const element of knoten.querySelectorAll<HTMLElement>("[id], [name]")) {
    element.removeAttribute("id");
    element.removeAttribute("name");
  }
  knoten.classList.add("kartenflug");
  knoten.setAttribute("aria-hidden", "true");
  knoten.setAttribute("inert", "");
  knoten.inert = true;

  // The clone will be moved out of its original CSS context, so preserve the
  // card's directly visible surface before that context disappears on redraw.
  const stil = window.getComputedStyle(quelle);
  Object.assign(knoten.style, {
    background: istTransparent(stil.backgroundColor)
      ? stil.getPropertyValue("--erhoben").trim() || "var(--erhoben)"
      : stil.background,
    color: stil.color,
    border: stil.border,
    borderRadius: stil.borderRadius,
    boxShadow: stil.boxShadow,
    font: stil.font,
  });
}

function warteAuf(animation: Animation): Promise<void> {
  // `finished` rejects on cancel. Cancellation is a normal end state here.
  return animation.finished.then(() => undefined, () => undefined);
}

/**
 * Creates a one-use motion controller. `abbrechen` also disposes the controller,
 * which keeps route cleanup from allowing a delayed flight to start afterwards.
 */
export function kartenbewegung(): {
  merken(element: HTMLElement): Ursprung;
  fliegen(von: Ursprung, ziel: HTMLElement): Promise<void>;
  abbrechen(): void;
} {
  let entsorgt = false;
  const fluege = new Set<Flug>();

  const merken = (element: HTMLElement): Ursprung => {
    const gemessen = element.getBoundingClientRect();
    const rect = new DOMRect(gemessen.x, gemessen.y, gemessen.width, gemessen.height);

    // Reduced motion must not create a duplicate card at all.
    if (entsorgt || bevorzugtWenigerBewegung()) {
      return { rect, knoten: element };
    }

    const klon = element.cloneNode(true) as HTMLElement;
    bereinigeKlon(klon, element);
    return { rect, knoten: klon };
  };

  const fliegen = async (von: Ursprung, ziel: HTMLElement): Promise<void> => {
    if (entsorgt || bevorzugtWenigerBewegung()) return;

    // Save these before changing the target: a caller may have intentionally
    // supplied its own inline presentation.
    const zielStile = {
      opacity: ziel.style.opacity,
      outlineColor: ziel.style.outlineColor,
      outlineStyle: ziel.style.outlineStyle,
      outlineWidth: ziel.style.outlineWidth,
      outlineOffset: ziel.style.outlineOffset,
    };
    const sichtbareDeckkraft = window.getComputedStyle(ziel).opacity;
    const indigo = window.getComputedStyle(ziel).getPropertyValue("--indigo").trim() || "transparent";
    const zielWiederherstellen = (): void => {
      ziel.style.opacity = zielStile.opacity;
      ziel.style.outlineColor = zielStile.outlineColor;
      ziel.style.outlineStyle = zielStile.outlineStyle;
      ziel.style.outlineWidth = zielStile.outlineWidth;
      ziel.style.outlineOffset = zielStile.outlineOffset;
    };

    // The real target stays hidden while its source identity is in flight.
    ziel.style.opacity = "0";
    const zielRect = ziel.getBoundingClientRect();
    const quellAusserhalb = istAusserhalb(von.rect);
    const zielAusserhalb = istAusserhalb(zielRect);

    let overlay: HTMLElement | undefined;
    const flug: Flug = {
      beendet: false,
      animationen: new Set<Animation>(),
      aufraeumen: () => {
        if (flug.beendet) return;
        flug.beendet = true;
        for (const animation of flug.animationen) animation.cancel();
        flug.animationen.clear();
        overlay?.remove();
        // A cancelled arrival must never leave presentation overrides behind.
        zielWiederherstellen();
        fluege.delete(flug);
      },
    };
    fluege.add(flug);

    const ankunft = async (): Promise<void> => {
      if (flug.beendet || zielAusserhalb) return;
      ziel.style.opacity = zielStile.opacity;
      ziel.style.outlineStyle = "solid";
      ziel.style.outlineWidth = "2px";
      const animation = ziel.animate(
        [
          { opacity: 0, outlineColor: "transparent", outlineOffset: "5px" },
          { opacity: sichtbareDeckkraft, outlineColor: indigo, outlineOffset: "0px" },
          { opacity: sichtbareDeckkraft, outlineColor: "transparent", outlineOffset: "0px" },
        ],
        { duration: ANKUNFT_DAUER, easing: "ease-out" },
      );
      flug.animationen.add(animation);
      await warteAuf(animation);
      flug.animationen.delete(animation);
      zielWiederherstellen();
    };

    try {
      // A source that has scrolled away cannot retain visual identity usefully.
      // Give the visible destination its short arrival treatment instead.
      if (quellAusserhalb || zielAusserhalb || von.rect.width <= 0 || von.rect.height <= 0) {
        await ankunft();
        return;
      }

      overlay = von.knoten;
      Object.assign(overlay.style, {
        position: "fixed",
        left: `${von.rect.left}px`,
        top: `${von.rect.top}px`,
        width: `${von.rect.width}px`,
        height: `${von.rect.height}px`,
        margin: "0",
        boxSizing: "border-box",
        pointerEvents: "none",
        zIndex: "2147483647",
        transformOrigin: "top left",
      });
      document.body.append(overlay);

      const x = zielRect.left - von.rect.left;
      const y = zielRect.top - von.rect.top;
      const scaleX = zielRect.width / von.rect.width;
      const scaleY = zielRect.height / von.rect.height;
      const animation = overlay.animate(
        [
          { transform: "translate(0px, 0px) scale(1, 1)" },
          { transform: `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})` },
        ],
        { duration: FLUG_DAUER, easing: "cubic-bezier(.2, .75, .2, 1)", fill: "none" },
      );
      flug.animationen.add(animation);
      await warteAuf(animation);
      flug.animationen.delete(animation);

      if (!flug.beendet) {
        overlay.remove();
        await ankunft();
      }
    } catch {
      // Motion is decorative; DOM or WAAPI failures must not block the action.
    } finally {
      zielWiederherstellen();
      flug.aufraeumen();
    }
  };

  return {
    merken,
    fliegen,
    abbrechen: () => {
      entsorgt = true;
      for (const flug of [...fluege]) flug.aufraeumen();
    },
  };
}
