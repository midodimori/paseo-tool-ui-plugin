export function autoExpandEdits() {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined"
    || typeof matchMedia === "undefined") return () => {};

  const visited = new WeakSet();
  // ponytail: desktop/web DOM controls in Paseo 0.8; use a native expansion API when exported.
  const desktop = matchMedia("(min-width: 720px)");
  const expand = () => {
    if (!desktop.matches) return; // Compact layouts open a sheet instead of an inline diff.
    for (const badge of document.querySelectorAll('[data-testid="tool-call-badge"]')) {
      if (!badge.getClientRects().length) continue;
      const header = badge.querySelector(':scope > [role="button"]');
      if (!header || visited.has(header)) continue;
      const label = header.querySelector('[dir="auto"]')?.textContent?.trim();
      if (label !== "Edit" && label !== "Write") continue;
      // Some native headers omit aria-expanded; their detail panel is a sibling.
      const expandedState = header.getAttribute("aria-expanded");
      const isExpanded = expandedState === null ? badge.children.length > 1 : expandedState === "true";
      visited.add(header); // Respect a manual collapse for this mounted card.
      if (!isExpanded) header.click();
    }
  };
  const observer = new MutationObserver(expand);
  observer.observe(document.body, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ["aria-expanded", "style", "class"],
  });
  desktop.addEventListener("change", expand);
  expand();
  return () => {
    observer.disconnect();
    desktop.removeEventListener("change", expand);
  };
}
