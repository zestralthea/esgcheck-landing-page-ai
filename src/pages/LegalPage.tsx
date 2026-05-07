import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LegalTableOfContents from "@/components/LegalTableOfContents";
import SEOHead from "@/components/SEOHead";
import {
  defaultLanguage,
  getLocaleUrl,
  languageMetadata,
  supportedLanguages,
  useLanguage,
  type SitePage,
} from "@/contexts/LanguageContext";
import {
  legalContent,
  legalPageLabels,
  legalPagePaths,
  legalTocLabels,
  legalUpdatedLabels,
  type LegalPageKind,
} from "@/content/legalContent";

const legalPageKindBySitePage: Partial<Record<SitePage, LegalPageKind>> = {
  privacy: "privacy",
  cookies: "cookies",
  legalNotice: "legalNotice",
};

interface LegalPageProps {
  page: SitePage;
}

export default function LegalPage({ page }: LegalPageProps) {
  const { language } = useLanguage();
  const pageKind = legalPageKindBySitePage[page] ?? "privacy";
  const content = legalContent[language][pageKind];
  const canonicalUrl = getLocaleUrl(language, page);
  const alternateLinks = [
    ...supportedLanguages.map((lang) => ({
      hrefLang: languageMetadata[lang].hrefLang,
      href: getLocaleUrl(lang, page),
    })),
    {
      hrefLang: "x-default",
      href: getLocaleUrl(defaultLanguage, page),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${content.title} | ESGCheck`}
        description={content.description}
        canonicalUrl={canonicalUrl}
        publishedTime="2026-05-07T00:00:00+02:00"
        modifiedTime="2026-05-07T00:00:00+02:00"
        alternateLinks={alternateLinks}
      />

      <Header />
      <main className="pt-[var(--header-height)]">
        <section className="border-b border-border bg-gradient-accent py-12">
          <div className="container mx-auto px-4">
            <nav className="mb-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {(Object.keys(legalPagePaths) as LegalPageKind[]).map((kind) => {
                const href = `/${language}/${legalPagePaths[kind]}/`;
                const isActive = kind === pageKind;

                return (
                  <a
                    className={`rounded-full border px-4 py-2 transition ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-primary/40 hover:text-foreground"
                    }`}
                    href={href}
                    key={kind}
                  >
                    {legalPageLabels[language][kind]}
                  </a>
                );
              })}
            </nav>

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              ESGCheck
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {content.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
              {content.description}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {content.updatedLabel ?? legalUpdatedLabels[language]}: {content.updated}
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
              <div className="lg:sticky lg:top-[calc(var(--header-height)-0.5rem)] lg:col-start-2 lg:row-start-1 lg:self-start">
                <LegalTableOfContents
                  sections={content.sections}
                  tocLabel={legalTocLabels[language]}
                />
              </div>

              <div className="space-y-8 lg:col-start-1 lg:row-start-1">
                {content.sections.map((section, index) => {
                  const sectionNumber = index + 1;

                  return (
                    <article
                      className="scroll-mt-[calc(var(--header-height)+16px)] rounded-2xl border border-border bg-card p-6 shadow-card"
                      id={`section-${sectionNumber}`}
                      key={`section-${sectionNumber}`}
                    >
                      <h2 className="text-2xl font-semibold text-foreground">
                        <span className="mr-3 text-primary">{sectionNumber}</span>
                        {section.title}
                      </h2>

                      {section.paragraphs?.map((paragraph) => (
                        <p className="mt-4 leading-8 text-muted-foreground" key={paragraph}>
                          {paragraph}
                        </p>
                      ))}

                      {section.list && (
                        <ul className="mt-4 space-y-3 text-muted-foreground">
                          {section.list.map((item) => (
                            <li className="leading-7" key={item}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.table && (
                        <div className="mt-5 overflow-x-auto">
                          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                            <thead>
                              <tr>
                                {section.table.headers.map((header) => (
                                  <th
                                    className="border-b border-border bg-secondary px-4 py-3 font-semibold text-foreground"
                                    key={header}
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {section.table.rows.map((row) => (
                                <tr className="border-b border-border/70" key={row.join("-")}>
                                  {row.map((cell) => (
                                    <td
                                      className="px-4 py-3 align-top leading-6 text-muted-foreground"
                                      key={cell}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {section.subsections?.map((subsection, subsectionIndex) => {
                        const subsectionNumber = subsectionIndex + 1;
                        const numberedLabel = `${sectionNumber}.${subsectionNumber}`;

                        return (
                          <section
                            className="mt-6"
                            id={`section-${sectionNumber}-${subsectionNumber}`}
                            key={`section-${sectionNumber}-${subsectionNumber}`}
                          >
                            <h3 className="text-lg font-semibold text-foreground">
                              <span className="mr-2 text-primary">{numberedLabel}</span>
                              {subsection.title}
                            </h3>

                            {subsection.paragraphs?.map((paragraph) => (
                              <p className="mt-2 leading-7 text-muted-foreground" key={paragraph}>
                                {paragraph}
                              </p>
                            ))}

                            {subsection.list && (
                              <ul className="mt-2 space-y-2 text-muted-foreground">
                                {subsection.list.map((item) => (
                                  <li className="leading-7" key={item}>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </section>
                        );
                      })}
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
