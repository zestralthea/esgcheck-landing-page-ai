import { useEffect, useMemo, useState } from "react";
import type { LegalSection } from "@/content/legalContent";

interface LegalTableOfContentsProps {
  sections: LegalSection[];
  tocLabel: string;
}

type TocEntry = {
  id: string;
  number: string;
  title: string;
  depth: 1 | 2;
};

const getAnchorOffset = () => {
  const headerHeightValue = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();
  const headerHeight = Number.parseFloat(headerHeightValue);

  return (Number.isFinite(headerHeight) ? headerHeight : 108) + 16;
};

export default function LegalTableOfContents({
  sections,
  tocLabel,
}: LegalTableOfContentsProps) {
  const entries = useMemo<TocEntry[]>(() => {
    const tocEntries: TocEntry[] = [];

    sections.forEach((section, index) => {
      const sectionNumber = index + 1;

      tocEntries.push({
        id: `section-${sectionNumber}`,
        number: `${sectionNumber}`,
        title: section.title,
        depth: 1,
      });

      section.subsections?.forEach((subsection, subsectionIndex) => {
        const subsectionNumber = subsectionIndex + 1;

        tocEntries.push({
          id: `section-${sectionNumber}-${subsectionNumber}`,
          number: `${sectionNumber}.${subsectionNumber}`,
          title: subsection.title,
          depth: 2,
        });
      });
    });

    return tocEntries;
  }, [sections]);

  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    if (entries.length === 0) {
      return;
    }

    let animationFrameId = 0;

    const updateActiveEntry = () => {
      const anchorOffset = getAnchorOffset();
      let currentEntry = entries[0];

      entries.forEach((entry) => {
        const element = document.getElementById(entry.id);

        if (element && element.getBoundingClientRect().top <= anchorOffset + 1) {
          currentEntry = entry;
        }
      });

      setActiveId(currentEntry.id);
    };

    const scheduleActiveEntryUpdate = () => {
      if (animationFrameId) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = 0;
        updateActiveEntry();
      });
    };

    updateActiveEntry();
    window.addEventListener("scroll", scheduleActiveEntryUpdate, { passive: true });
    window.addEventListener("resize", scheduleActiveEntryUpdate);
    window.addEventListener("hashchange", scheduleActiveEntryUpdate);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("scroll", scheduleActiveEntryUpdate);
      window.removeEventListener("resize", scheduleActiveEntryUpdate);
      window.removeEventListener("hashchange", scheduleActiveEntryUpdate);
    };
  }, [entries]);

  if (entries.length === 0) {
    return null;
  }

  const renderLink = (entry: TocEntry) => {
    const isActive = entry.id === activeId;

    return (
      <li key={entry.id}>
        <a
          aria-current={isActive ? "location" : undefined}
          className={[
            "block rounded-md py-1 text-sm leading-6 transition-colors",
            entry.depth === 2 ? "pl-6" : "pl-2",
            isActive
              ? "font-semibold text-primary"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
          href={`#${entry.id}`}
          onClick={() => setActiveId(entry.id)}
        >
          <span className="mr-2 tabular-nums">{entry.number}</span>
          {entry.title}
        </a>
      </li>
    );
  };

  return (
    <aside className="mb-8 lg:mb-0 lg:mt-0">
      <details className="rounded-2xl border border-border bg-card p-4 shadow-card lg:hidden">
        <summary className="cursor-pointer list-none font-semibold text-foreground">
          {tocLabel}
        </summary>
        <nav aria-label={tocLabel} className="mt-3">
          <ul className="space-y-1">{entries.map(renderLink)}</ul>
        </nav>
      </details>

      <div className="hidden lg:block">
        <nav aria-label={tocLabel}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {tocLabel}
          </p>
          <ul className="space-y-1 border-l border-border">{entries.map(renderLink)}</ul>
        </nav>
      </div>
    </aside>
  );
}
