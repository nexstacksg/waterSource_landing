"use client";

import { useEffect } from "react";

type ExpandableOptions = {
  root: HTMLElement;
  contentClass: string;
  buttonClass: string;
  headingSelector: string;
};

type ButtonBinding = {
  button: HTMLButtonElement;
  handler: () => void;
};

export default function SiteInteractions() {
  useEffect(() => {
    const cleanup: Array<() => void> = [];
    const deadlineKey = "watersourceCountdownDeadline";
    let deadline = window.localStorage.getItem(deadlineKey);

    if (!deadline || new Date(deadline) < new Date()) {
      const nextDeadline = new Date();
      nextDeadline.setDate(nextDeadline.getDate() + 7);
      nextDeadline.setHours(23, 59, 59, 999);
      deadline = nextDeadline.toISOString();
      window.localStorage.setItem(deadlineKey, deadline);
    }
    const activeDeadline = deadline;

    function tick() {
      const diff = Math.max(
        0,
        new Date(activeDeadline).getTime() - new Date().getTime(),
      );
      const values = {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      };

      for (const [id, value] of Object.entries(values)) {
        const element = document.getElementById(id);
        if (element) element.textContent = String(value).padStart(2, "0");
      }
    }

    tick();
    const timer = window.setInterval(tick, 1000);
    cleanup.push(() => window.clearInterval(timer));

    const programTrack = document.querySelector<HTMLElement>(
      "#programs .marquee-track",
    );
    const programButtons = document.querySelectorAll<HTMLButtonElement>(
      "#programs .program-nav button",
    );

    if (programTrack && programButtons.length === 2) {
      const step = () => {
        const tileWidth =
          programTrack
            .querySelector<HTMLElement>(".program-tile")
            ?.getBoundingClientRect().width ?? 388;
        return tileWidth + 22;
      };
      const previous = () =>
        programTrack.scrollBy({ left: -step(), behavior: "smooth" });
      const next = () =>
        programTrack.scrollBy({ left: step(), behavior: "smooth" });

      programButtons[0].addEventListener("click", previous);
      programButtons[1].addEventListener("click", next);
      cleanup.push(() => {
        programButtons[0].removeEventListener("click", previous);
        programButtons[1].removeEventListener("click", next);
      });
    }

    function ensureExpandableStructure({
      root,
      contentClass,
      buttonClass,
      headingSelector,
    }: ExpandableOptions) {
      let content = root.querySelector<HTMLElement>(
        `:scope > .${contentClass}`,
      );
      let button = root.querySelector<HTMLButtonElement>(
        `:scope > .${buttonClass}`,
      );

      if (!content) {
        content = document.createElement("div");
        content.className = contentClass;
        const heading = root.querySelector<HTMLElement>(
          `:scope > ${headingSelector}`,
        );
        let node = heading ? heading.nextSibling : root.firstChild;

        while (node) {
          const nextNode = node.nextSibling;
          content.appendChild(node);
          node = nextNode;
        }

        root.appendChild(content);
      }

      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = buttonClass;
        button.textContent = "Read more";
        button.setAttribute("aria-expanded", "false");
        root.appendChild(button);
      }

      return { content, button };
    }

    const whyBindings: ButtonBinding[] = [];

    function initializeWhyCards() {
      document
        .querySelectorAll<HTMLElement>(".why-reason-card")
        .forEach((card) => {
          const heading = card.querySelector<HTMLElement>(":scope > h3");
          if (!heading) return;

          const { content, button } = ensureExpandableStructure({
            root: card,
            contentClass: "why-card-content",
            buttonClass: "why-readmore-btn",
            headingSelector: "h3",
          });

          if (!whyBindings.some((binding) => binding.button === button)) {
            const handler = () => {
              const expanded = card.classList.toggle("is-expanded");
              content.style.maxHeight = expanded
                ? "none"
                : card.dataset.collapsedMax || "";
              button.textContent = expanded ? "Show less" : "Read more";
              button.setAttribute("aria-expanded", String(expanded));
            };
            button.addEventListener("click", handler);
            whyBindings.push({ button, handler });
          }

          card.classList.remove("is-expanded");
          button.textContent = "Read more";
          button.setAttribute("aria-expanded", "false");
          button.style.display = "none";
          content.style.maxHeight = "none";
          delete card.dataset.collapsedMax;

          const headingHeight = heading.getBoundingClientRect().height;
          const buttonHeight = button.getBoundingClientRect().height || 40;
          const gap = 12;
          const availableWithoutButton =
            card.clientHeight - headingHeight - gap;

          if (content.scrollHeight > availableWithoutButton) {
            button.style.display = "inline-flex";
            const available =
              card.clientHeight - headingHeight - buttonHeight - gap * 2;
            card.dataset.collapsedMax = `${Math.max(0, available)}px`;
            content.style.maxHeight = card.dataset.collapsedMax;
          }
        });
    }

    const functionalBindings: ButtonBinding[] = [];

    function initializeFunctionalPanels() {
      const panels = document.querySelectorAll<HTMLElement>(
        ".functional-water-grid .functional-panel",
      );
      if (!panels.length) return;
      const baseHeight = 564;

      panels.forEach((panel) => {
        const heading = panel.querySelector<HTMLElement>(":scope > h3");
        if (!heading) return;

        const { content, button } = ensureExpandableStructure({
          root: panel,
          contentClass: "functional-panel-content",
          buttonClass: "functional-readmore-btn",
          headingSelector: "h3",
        });

        if (!functionalBindings.some((binding) => binding.button === button)) {
          const handler = () => {
            const expanded = panel.classList.toggle("is-expanded");
            panel.style.height = expanded
              ? "auto"
              : panel.dataset.baseHeight || "";
            content.style.maxHeight = expanded
              ? "none"
              : panel.dataset.collapsedMax || "";
            button.textContent = expanded ? "Show less" : "Read more";
            button.setAttribute("aria-expanded", String(expanded));
          };
          button.addEventListener("click", handler);
          functionalBindings.push({ button, handler });
        }

        panel.classList.remove("is-expanded");
        panel.style.height = `${baseHeight}px`;
        panel.dataset.baseHeight = `${baseHeight}px`;
        content.style.maxHeight = "none";
        button.style.display = "none";
        button.textContent = "Read more";
        button.setAttribute("aria-expanded", "false");

        const headingHeight = heading.getBoundingClientRect().height;
        const buttonHeight = button.getBoundingClientRect().height || 28;
        const availableWithoutButton = baseHeight - headingHeight - 12;

        if (content.scrollHeight > availableWithoutButton) {
          button.style.display = "inline-flex";
          const available = baseHeight - headingHeight - buttonHeight - 18;
          panel.dataset.collapsedMax = `${Math.max(0, available)}px`;
          content.style.maxHeight = panel.dataset.collapsedMax;
        }
      });
    }

    initializeWhyCards();
    initializeFunctionalPanels();
    window.addEventListener("resize", initializeWhyCards);
    window.addEventListener("resize", initializeFunctionalPanels);

    cleanup.push(() => {
      window.removeEventListener("resize", initializeWhyCards);
      window.removeEventListener("resize", initializeFunctionalPanels);
      whyBindings.forEach(({ button, handler }) =>
        button.removeEventListener("click", handler),
      );
      functionalBindings.forEach(({ button, handler }) =>
        button.removeEventListener("click", handler),
      );
    });

    if (window.location.hash) {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(window.location.hash)
          ?.scrollIntoView();
      });
    }

    return () => cleanup.forEach((dispose) => dispose());
  }, []);

  return null;
}
