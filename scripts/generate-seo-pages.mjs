import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const templatePath = path.join(distDir, "index.html");

const siteBaseUrl = "https://esgcheck.ch";
const publishedTime = "2026-04-28T00:00:00+02:00";
const modifiedTime = "2026-09-10T00:00:00+02:00";
const ogImage = `${siteBaseUrl}/og-image.jpg`;

const languages = {
  en: {
    htmlLang: "en",
    hrefLang: "en",
    seo: {
      title: "ESGCheck | ESG Evidence and Response Platform for B2B SMEs",
      description:
        "Understand ESG information requests, find supporting evidence, identify gaps, and prepare traceable responses for human approval with ESGCheck.",
      keywords:
        "ESG evidence, ESG responses, SME ESG, ESG questionnaires, VSME, GRI, ESRS, Swiss ESG, ESG information requests, supplier ESG",
      ogImageAlt: "ESGCheck ESG evidence and response platform for B2B SMEs and suppliers",
    },
    confirmation: {
      title: "Please Confirm Your Email | ESGCheck",
      description:
        "Please confirm your interest in ESGCheck research using the link sent to your email address.",
    },
    thankYou: {
      title: "Thank You for Your Interest | ESGCheck",
      description:
        "Your email address and ESGCheck research interest have been confirmed.",
    },
  },
  de: {
    htmlLang: "de-CH",
    hrefLang: "de-CH",
    seo: {
      title: "ESGCheck | Nachweisgestützte ESG-Antworten für B2B-KMU",
      description:
        "ESG-Anfragen verstehen, Nachweise finden, Lücken erkennen und nachvollziehbare Antworten zur menschlichen Freigabe vorbereiten.",
      keywords:
        "ESG-Nachweise, ESG-Antworten, ESG-Fragebogen, ESG für KMU, VSME, GRI, ESRS, Swiss ESG, Lieferanten-ESG",
      ogImageAlt: "ESGCheck Plattform für nachweisgestützte ESG-Antworten von B2B-KMU und Lieferanten",
    },
    confirmation: {
      title: "E-Mail-Adresse bestätigen | ESGCheck",
      description:
        "Bitte bestätigen Sie Ihr Interesse an der ESGCheck Forschung über den Link in der gesendeten E-Mail.",
    },
    thankYou: {
      title: "Vielen Dank für Ihr Interesse | ESGCheck",
      description:
        "Ihre E-Mail-Adresse und Ihr Interesse an der ESGCheck Forschung wurden bestätigt.",
    },
  },
  fr: {
    htmlLang: "fr-CH",
    hrefLang: "fr-CH",
    seo: {
      title: "ESGCheck | Réponses ESG étayées pour les PME B2B",
      description:
        "Comprenez les demandes ESG, retrouvez les preuves, identifiez les lacunes et préparez des réponses traçables pour validation humaine.",
      keywords:
        "preuves ESG, réponses ESG, questionnaires ESG, ESG pour PME, VSME, GRI, ESRS, ESG suisse, ESG fournisseurs",
      ogImageAlt: "Plateforme ESGCheck de preuves et réponses pour PME B2B et fournisseurs",
    },
    confirmation: {
      title: "Confirmez votre adresse e-mail | ESGCheck",
      description:
        "Veuillez confirmer votre intérêt pour la recherche ESGCheck avec le lien envoyé par e-mail.",
    },
    thankYou: {
      title: "Merci pour votre intérêt | ESGCheck",
      description:
        "Votre adresse e-mail et votre intérêt pour la recherche ESGCheck ont été confirmés.",
    },
  },
  it: {
    htmlLang: "it-CH",
    hrefLang: "it-CH",
    seo: {
      title: "ESGCheck | Risposte ESG supportate da evidenze per PMI B2B",
      description:
        "Comprendi le richieste ESG, trova le evidenze, individua le lacune e prepara risposte tracciabili per l'approvazione umana.",
      keywords:
        "evidenze ESG, risposte ESG, questionari ESG, ESG per PMI, VSME, GRI, ESRS, ESG Svizzera, ESG fornitori",
      ogImageAlt: "Piattaforma ESGCheck per evidenze e risposte di PMI B2B e fornitori",
    },
    confirmation: {
      title: "Conferma il tuo indirizzo email | ESGCheck",
      description:
        "Conferma il tuo interesse nella ricerca ESGCheck tramite il link inviato via email.",
    },
    thankYou: {
      title: "Grazie per il tuo interesse | ESGCheck",
      description:
        "Il tuo indirizzo email e il tuo interesse nella ricerca ESGCheck sono stati confermati.",
    },
  },
  rm: {
    htmlLang: "rm-CH",
    hrefLang: "rm-CH",
    seo: {
      title: "ESGCheck | Respostas ESG sustegnidas da cumprovas per PMI B2B",
      description:
        "Chapir dumondas ESG, chattar cumprovas, identifitgar largias e preparar respostas traceablas per approvaziun umana.",
      keywords:
        "cumprovas ESG, respostas ESG, questiunaris ESG, ESG per PMI, VSME, GRI, ESRS, ESG Svizra, ESG da furniturs",
      ogImageAlt: "Plattafurma ESGCheck per cumprovas e respostas da PMI B2B e furniturs",
    },
    confirmation: {
      title: "Confermar l'adressa dad e-mail | ESGCheck",
      description:
        "Confermai Voss interess a la perscrutaziun ESGCheck cun il link tramess per e-mail.",
    },
    thankYou: {
      title: "Grazia fitg per Voss interess | ESGCheck",
      description:
        "Vossa adressa dad e-mail e Voss interess per la perscrutaziun ESGCheck èn vegnids confermads.",
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
