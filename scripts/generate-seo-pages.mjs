import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const templatePath = path.join(distDir, "index.html");

const siteBaseUrl = "https://esgcheck.ch";
const publishedTime = "2026-04-28T00:00:00+02:00";
const modifiedTime = "2026-04-30T00:00:00+02:00";
const ogImage = `${siteBaseUrl}/og-image.jpg`;

const languages = {
  de: {
    htmlLang: "de-CH",
    hrefLang: "de-CH",
    seo: {
      title: "ESGCheck | Praxisnahe ESG-Ersteinschätzung für wachsende KMU",
      description:
        "Machen Sie aus Unternehmensunterlagen eine klare erste ESG-Einschätzung mit strukturierten Scores, sichtbaren Lücken und konkreten nächsten Schritten für steigende ESG-Informationsanfragen.",
      keywords:
        "ESG-Einschätzung, ESG für KMU, VSME-Readiness, GRI, Swiss ESG, ESG-Informationsanfragen, Nachhaltigkeitsbewertung, dokumentenbasierte ESG-Einschätzung",
      ogImageAlt: "ESGCheck praxisnahe ESG-Ersteinschätzung für wachsende KMU",
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
  en: {
    htmlLang: "en",
    hrefLang: "en",
    seo: {
      title: "ESGCheck | Practical ESG First Assessment for Growing SMEs",
      description:
        "Turn company documents into a clear first ESG assessment with structured scores, visible gaps, and practical next steps for rising ESG information requests.",
      keywords:
        "ESG assessment, SME ESG, VSME readiness, GRI, Swiss ESG, ESG information requests, sustainability assessment, document-based ESG",
      ogImageAlt: "ESGCheck practical ESG first assessment platform for growing SMEs",
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
  fr: {
    htmlLang: "fr-CH",
    hrefLang: "fr-CH",
    seo: {
      title: "ESGCheck | Première évaluation ESG pragmatique pour les PME en croissance",
      description:
        "Transformez vos documents d'entreprise en une première évaluation ESG claire avec des scores structurés, des écarts visibles et des prochaines étapes pour les demandes croissantes d'informations ESG.",
      keywords:
        "évaluation ESG, ESG pour PME, préparation VSME, GRI, Swiss ESG, demandes d'informations ESG, évaluation de durabilité, ESG fondé sur les documents",
      ogImageAlt: "ESGCheck première évaluation ESG pragmatique pour les PME en croissance",
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
      title: "ESGCheck | Prima valutazione ESG pratica per PMI in crescita",
      description:
        "Trasforma i documenti aziendali in una prima valutazione ESG chiara con punteggi strutturati, lacune visibili e prossimi passi per richieste crescenti di informazioni ESG.",
      keywords:
        "valutazione ESG, ESG per PMI, readiness VSME, GRI, ESG Svizzera, richieste di informazioni ESG, valutazione sostenibilita, ESG basato sui documenti",
      ogImageAlt: "ESGCheck prima valutazione ESG pratica per PMI in crescita",
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
      title: "ESGCheck | Emprima valitaziun ESG pragmatica per PMI",
      description:
        "Transfurmai documents d'interpresa en ina emprima valitaziun ESG clera cun punctaziuns structuradas, largias visiblas e proxims pass per dumondas creschentas d'infurmaziuns ESG.",
      keywords:
        "valitaziun ESG, ESG per PMI, readiness VSME, GRI, ESG Svizra, dumondas d'infurmaziuns ESG, valitaziun da durabilitad, ESG sin basa da documents",
      ogImageAlt: "ESGCheck emprima valitaziun ESG pragmatica per PMI che creschan",
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

const pageTypes = {
  home: { path: "", noindex: false, metaKey: "seo" },
  confirmation: { path: "confirmation", noindex: true, metaKey: "confirmation" },
  thankYou: { path: "thank-you", noindex: true, metaKey: "thankYou" },
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
    href: getLocaleUrl("de", pageType),
  },
];

const renderSeoBlock = ({ lang, pageType }) => {
  const language = languages[lang];
  const pageConfig = pageTypes[pageType];
  const metadata = language[pageConfig.metaKey];
  const canonicalUrl = getLocaleUrl(lang, pageType);
  const robots = pageConfig.noindex ? "noindex, nofollow" : "index, follow";

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
    /    <title>[\s\S]*?    <link rel="stylesheet" href="https:\/\/sibforms\.com\/forms\/end-form\/build\/sib-styles\.css" \/>/;

  if (!seoBlockPattern.test(template)) {
    throw new Error("Unable to find the SEO head block in dist/index.html.");
  }

  return template
    .replace(/<html lang="[^"]+">/, `<html lang="${language.htmlLang}">`)
    .replace(
      seoBlockPattern,
      `${seoBlock}\n    <link rel="preconnect" href="https://challenges.cloudflare.com" />\n\n    <link rel="stylesheet" href="https://sibforms.com/forms/end-form/build/sib-styles.css" />`,
    )
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

await writeFile(templatePath, localizeHtml({ template, lang: "de", pageType: "home" }));

for (const lang of Object.keys(languages)) {
  for (const pageType of Object.keys(pageTypes)) {
    await writeLocalizedPage({ template, lang, pageType });
  }
}

console.log("Generated localized SEO HTML pages.");
