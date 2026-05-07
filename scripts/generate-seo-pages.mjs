import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const templatePath = path.join(distDir, "index.html");

const siteBaseUrl = "https://esgcheck.ch";
const publishedTime = "2026-04-28T00:00:00+02:00";
const modifiedTime = "2026-05-01T00:00:00+02:00";
const ogImage = `${siteBaseUrl}/og-image.jpg`;

const languages = {
  en: {
    htmlLang: "en",
    hrefLang: "en",
    seo: {
      title: "ESGCheck | Practical ESG Readiness Overview for Growing B2B SMEs",
      description:
        "Turn company documents into a clear ESG readiness overview with evidence mapping, visible gaps, practical next steps, and an indicative score for rising ESG information requests.",
      keywords:
        "ESG readiness, SME ESG, VSME readiness, GRI, Swiss ESG, ESG information requests, sustainability readiness, document-based ESG",
      ogImageAlt: "ESGCheck practical ESG readiness overview platform for growing B2B SMEs",
    },
    confirmation: {
      title: "Please Confirm Your Email | ESGCheck",
      description:
        "Please confirm your ESGCheck early-access request using the link sent to your email address.",
    },
    thankYou: {
      title: "Thank You for Signing Up | ESGCheck",
      description:
        "Your ESGCheck email address has been confirmed. Thank you for signing up for updates.",
    },
  },
  de: {
    htmlLang: "de-CH",
    hrefLang: "de-CH",
    seo: {
      title: "ESGCheck | Praxisnaher ESG-Readiness-Überblick für wachsende B2B-KMU",
      description:
        "Machen Sie aus Unternehmensunterlagen einen klaren ESG-Readiness-Überblick mit Nachweis-Mapping, sichtbaren Lücken, konkreten nächsten Schritten und indikativem Score für steigende ESG-Informationsanfragen.",
      keywords:
        "ESG-Readiness, ESG für KMU, VSME-Readiness, GRI, Swiss ESG, ESG-Informationsanfragen, Nachhaltigkeits-Readiness, dokumentenbasierte ESG",
      ogImageAlt: "ESGCheck praxisnaher ESG-Readiness-Überblick für wachsende B2B-KMU",
    },
    confirmation: {
      title: "E-Mail-Adresse bestätigen | ESGCheck",
      description:
        "Bitte bestätigen Sie Ihre ESGCheck Early-Access-Anfrage über den Link in der gesendeten E-Mail.",
    },
    thankYou: {
      title: "Vielen Dank für Ihre Anmeldung | ESGCheck",
      description:
        "Ihre E-Mail-Adresse für ESGCheck wurde bestätigt. Vielen Dank für Ihre Anmeldung zu Updates.",
    },
  },
  fr: {
    htmlLang: "fr-CH",
    hrefLang: "fr-CH",
    seo: {
      title: "ESGCheck | Aperçu pratique de préparation ESG pour les PME B2B en croissance",
      description:
        "Transformez vos documents d'entreprise en un aperçu clair de préparation ESG avec cartographie des justificatifs, écarts visibles, prochaines étapes pratiques et score indicatif pour les demandes croissantes d'informations ESG.",
      keywords:
        "préparation ESG, ESG pour PME, préparation VSME, GRI, Swiss ESG, demandes d'informations ESG, préparation durabilité, ESG fondé sur les documents",
      ogImageAlt: "ESGCheck aperçu pratique de préparation ESG pour les PME B2B en croissance",
    },
    confirmation: {
      title: "Confirmez votre adresse e-mail | ESGCheck",
      description:
        "Veuillez confirmer votre demande d'accès anticipé à ESGCheck avec le lien envoyé par e-mail.",
    },
    thankYou: {
      title: "Merci pour votre inscription | ESGCheck",
      description:
        "Votre adresse e-mail ESGCheck a été confirmée. Merci pour votre inscription aux mises à jour.",
    },
  },
  it: {
    htmlLang: "it-CH",
    hrefLang: "it-CH",
    seo: {
      title: "ESGCheck | Panoramica pratica di readiness ESG per PMI B2B in crescita",
      description:
        "Trasforma i documenti aziendali in una panoramica chiara di readiness ESG con mappatura delle evidenze, lacune visibili, prossimi passi pratici e un punteggio indicativo per richieste crescenti di informazioni ESG.",
      keywords:
        "readiness ESG, ESG per PMI, readiness VSME, GRI, ESG Svizzera, richieste di informazioni ESG, readiness sostenibilita, ESG basato sui documenti",
      ogImageAlt: "ESGCheck panoramica pratica di readiness ESG per PMI B2B in crescita",
    },
    confirmation: {
      title: "Conferma il tuo indirizzo email | ESGCheck",
      description:
        "Conferma la richiesta di accesso anticipato a ESGCheck tramite il link inviato via email.",
    },
    thankYou: {
      title: "Grazie per la tua iscrizione | ESGCheck",
      description:
        "Il tuo indirizzo email per ESGCheck è stato confermato. Grazie per esserti iscritto agli aggiornamenti.",
    },
  },
  rm: {
    htmlLang: "rm-CH",
    hrefLang: "rm-CH",
    seo: {
      title: "ESGCheck | Survista pragmatica da readiness ESG per PMI B2B",
      description:
        "Transfurmai documents d'interpresa en ina survista clera da readiness ESG cun mapping da cumprovas, largias visiblas, proxims pass pratics ed ina punctaziun indicativa per dumondas creschentas d'infurmaziuns ESG.",
      keywords:
        "readiness ESG, ESG per PMI, readiness VSME, GRI, ESG Svizra, dumondas d'infurmaziuns ESG, readiness da durabilitad, ESG sin basa da documents",
      ogImageAlt: "ESGCheck survista pragmatica da readiness ESG per PMI B2B che creschan",
    },
    confirmation: {
      title: "Confermar l'adressa dad e-mail | ESGCheck",
      description:
        "Confermai per plaschair Vossa dumonda d'access anticipà ad ESGCheck cun il link tramess per e-mail.",
    },
    thankYou: {
      title: "Grazia fitg per Vossa annunzia | ESGCheck",
      description:
        "Vossa adressa dad e-mail per ESGCheck è vegnida confermada. Grazia fitg per Vossa annunzia als updates.",
    },
  },
};

const legalMetadata = {
  en: {
    privacy: {
      title: "Privacy Policy | ESGCheck",
      description: "How ESGCheck handles personal data on this landing page.",
    },
    cookies: {
      title: "Cookie Policy | ESGCheck",
      description: "Cookies, local storage, and similar technologies used by ESGCheck.",
    },
    legalNotice: {
      title: "Legal Notice | ESGCheck",
      description: "Project identity, contact details, and legal disclaimer for ESGCheck.",
    },
  },
  de: {
    privacy: {
      title: "Datenschutzerklaerung | ESGCheck",
      description: "Wie ESGCheck Personendaten auf dieser Landing Page bearbeitet.",
    },
    cookies: {
      title: "Cookie-Richtlinie | ESGCheck",
      description: "Cookies, localStorage und aehnliche Technologien von ESGCheck.",
    },
    legalNotice: {
      title: "Impressum | ESGCheck",
      description: "Projektidentitaet, Kontakt und Haftungshinweise fuer ESGCheck.",
    },
  },
  fr: {
    privacy: {
      title: "Politique de confidentialite | ESGCheck",
      description: "Comment ESGCheck traite les donnees personnelles sur cette landing page.",
    },
    cookies: {
      title: "Politique relative aux cookies | ESGCheck",
      description: "Cookies, stockage local et technologies similaires utilises par ESGCheck.",
    },
    legalNotice: {
      title: "Mentions legales | ESGCheck",
      description: "Identite du projet, contact et clauses de non-responsabilite.",
    },
  },
  it: {
    privacy: {
      title: "Informativa privacy | ESGCheck",
      description: "Come ESGCheck tratta i dati personali su questa landing page.",
    },
    cookies: {
      title: "Informativa sui cookie | ESGCheck",
      description: "Cookie, localStorage e tecnologie simili usate da ESGCheck.",
    },
    legalNotice: {
      title: "Note legali | ESGCheck",
      description: "Identita del progetto, contatti e disclaimer.",
    },
  },
  rm: {
    privacy: {
      title: "Decleraziun da protecziun da datas | ESGCheck",
      description: "Co ESGCheck tracta datas persunalas sin questa landing page.",
    },
    cookies: {
      title: "Politica da cookies | ESGCheck",
      description: "Cookies, localStorage e tecnologias sumegliantas duvradas dad ESGCheck.",
    },
    legalNotice: {
      title: "Impressum | ESGCheck",
      description: "Identitad dal project, contact e renviaments legals.",
    },
  },
};

const pageTypes = {
  home: { path: "", noindex: false, metaKey: "seo" },
  confirmation: { path: "confirmation", noindex: true, metaKey: "confirmation" },
  thankYou: { path: "thank-you", noindex: true, metaKey: "thankYou" },
  privacy: { path: "privacy", noindex: false, metaKey: "privacy" },
  cookies: { path: "cookies", noindex: false, metaKey: "cookies" },
  legalNotice: { path: "legal-notice", noindex: false, metaKey: "legalNotice" },
};

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getLocaleUrl = (lang, pageType = "home") => {
  const pagePath = pageTypes[pageType].path;
  const pathSuffix = pagePath ? `${pagePath}/` : "";

  return `${siteBaseUrl}/${lang}/${pathSuffix}`;
};

const getAlternateLinks = (pageType) => [
  ...Object.entries(languages).map(([lang, metadata]) => ({
    hrefLang: metadata.hrefLang,
    href: getLocaleUrl(lang, pageType),
  })),
  {
    hrefLang: "x-default",
    href: getLocaleUrl("en", pageType),
  },
];

const renderSeoBlock = ({ lang, pageType }) => {
  const language = languages[lang];
  const pageConfig = pageTypes[pageType];
  const metadata = language[pageConfig.metaKey] ?? legalMetadata[lang]?.[pageType];
  const canonicalUrl = getLocaleUrl(lang, pageType);
  const robots = pageConfig.noindex ? "noindex, nofollow" : "index, follow";

  if (!metadata) {
    throw new Error(`Missing metadata for ${lang}/${pageType}.`);
  }

  return `    <title>${escapeHtml(metadata.title)}</title>
    <meta name="description" content="${escapeHtml(metadata.description)}" />
    <meta name="keywords" content="${escapeHtml(language.seo.keywords)}" />
    <meta name="robots" content="${robots}" />
    <meta name="author" content="ESGCheck" />
    <meta name="date" content="${publishedTime}" />
    <link rel="canonical" href="${canonicalUrl}" />
${getAlternateLinks(pageType)
  .map(
    ({ hrefLang, href }) =>
      `    <link rel="alternate" href="${href}" hreflang="${hrefLang}" />`,
  )
  .join("\n")}

    <meta property="og:title" content="${escapeHtml(metadata.title)}" />
    <meta property="og:description" content="${escapeHtml(metadata.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="ESGCheck" />
    <meta property="article:author" content="ESGCheck" />
    <meta property="article:published_time" content="${publishedTime}" />
    <meta property="article:modified_time" content="${modifiedTime}" />
    <meta property="og:updated_time" content="${modifiedTime}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:secure_url" content="${ogImage}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(language.seo.ogImageAlt)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(metadata.title)}" />
    <meta name="twitter:description" content="${escapeHtml(metadata.description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="twitter:image:alt" content="${escapeHtml(language.seo.ogImageAlt)}" />`;
};

const localizeHtml = ({ template, lang, pageType }) => {
  const language = languages[lang];
  const seoBlock = renderSeoBlock({ lang, pageType });
  const seoBlockPattern =
    /    <title>[\s\S]*?    <meta name="twitter:image:alt" content="[^"]+" \/>/;

  if (!seoBlockPattern.test(template)) {
    throw new Error("Unable to find the SEO head block in dist/index.html.");
  }

  return template
    .replace(/<html lang="[^"]+">/, `<html lang="${language.htmlLang}">`)
    .replace(seoBlockPattern, seoBlock)
    .replace(/window\.LOCALE = "[^"]+";/, `window.LOCALE = "${lang}";`);
};

const writeLocalizedPage = async ({ template, lang, pageType }) => {
  const pageConfig = pageTypes[pageType];
  const relativeDir = pageConfig.path ? path.join(lang, pageConfig.path) : lang;
  const outputDir = path.join(distDir, relativeDir);
  const html = localizeHtml({ template, lang, pageType });

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), html);
};

const template = await readFile(templatePath, "utf8");

await writeFile(templatePath, localizeHtml({ template, lang: "en", pageType: "home" }));

for (const lang of Object.keys(languages)) {
  for (const pageType of Object.keys(pageTypes)) {
    await writeLocalizedPage({ template, lang, pageType });
  }
}

console.log("Generated localized SEO HTML pages.");
