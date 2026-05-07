import type { Language } from "@/contexts/LanguageContext";

export type LegalPageKind = "privacy" | "cookies" | "legalNotice";

type LegalTable = {
  headers: string[];
  rows: string[][];
};

export type LegalSubsection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
};

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  table?: LegalTable;
  subsections?: LegalSubsection[];
};

export type LegalPageContent = {
  title: string;
  description: string;
  updated: string;
  updatedLabel?: string;
  sections: LegalSection[];
};

export const legalPagePaths: Record<LegalPageKind, string> = {
  privacy: "privacy",
  cookies: "cookies",
  legalNotice: "legal-notice",
};

export const legalPageLabels: Record<Language, Record<LegalPageKind, string>> = {
  en: {
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    legalNotice: "Legal Notice",
  },
  de: {
    privacy: "Datenschutzerklaerung",
    cookies: "Cookie-Richtlinie",
    legalNotice: "Impressum",
  },
  fr: {
    privacy: "Politique de confidentialite",
    cookies: "Politique relative aux cookies",
    legalNotice: "Mentions legales",
  },
  it: {
    privacy: "Informativa privacy",
    cookies: "Informativa sui cookie",
    legalNotice: "Note legali",
  },
  rm: {
    privacy: "Decleraziun da protecziun da datas",
    cookies: "Politica da cookies",
    legalNotice: "Impressum",
  },
};

const updated = "May 7, 2026";
export const legalUpdatedLabels: Record<Language, string> = {
  en: "Last updated",
  de: "Zuletzt aktualisiert",
  fr: "Derniere mise a jour",
  it: "Ultimo aggiornamento",
  rm: "Ultima actualisaziun",
};

export const legalTocLabels: Record<Language, string> = {
  en: "On this page",
  de: "Auf dieser Seite",
  fr: "Sur cette page",
  it: "In questa pagina",
  rm: "Sin questa pagina",
};

const cookieRows = {
  en: [
    ["esgcheck_cookie_consent_v1", "ESGCheck", "Essential", "Stores privacy preferences in localStorage.", "Until changed, cleared, or replaced by a new consent version."],
    ["Cloudflare Turnstile", "Cloudflare", "Essential security", "Protects the waitlist form against spam and abuse. Provider-controlled identifiers and browser signals may vary.", "Loaded only for or near the waitlist form; retention follows Cloudflare settings."],
    ["_ga, _ga_*", "Google Analytics", "Optional analytics", "Helps understand website usage after analytics consent.", "Typically up to 2 years, depending on Google settings."],
    ["Vercel Analytics", "Vercel", "Optional analytics", "Provides aggregated, cookie-free site analytics, gated behind analytics consent for caution.", "Provider retention according to Vercel settings."],
    ["Brevo Tracker", "Brevo", "Optional marketing automation", "Supports future email automation and campaign measurement after marketing consent.", "Provider-controlled identifiers may vary."],
    ["Brevo Conversations", "Brevo", "Optional chat support", "Loads the chat widget after chat consent.", "Provider-controlled identifiers may vary."],
  ],
  de: [
    ["esgcheck_cookie_consent_v1", "ESGCheck", "Essenziell", "Speichert Datenschutzeinstellungen im localStorage.", "Bis zur Aenderung, Loeschung oder Ersetzung durch eine neue Consent-Version."],
    ["Cloudflare Turnstile", "Cloudflare", "Essenzielle Sicherheit", "Schuetzt das Wartelistenformular vor Spam und Missbrauch. Anbieterkennungen und Browsersignale koennen variieren.", "Wird nur fuer oder nahe dem Wartelistenformular geladen; Aufbewahrung nach Cloudflare-Einstellungen."],
    ["_ga, _ga_*", "Google Analytics", "Optionale Analyse", "Hilft nach Einwilligung, die Nutzung der Website zu verstehen.", "In der Regel bis zu 2 Jahre, abhaengig von Google-Einstellungen."],
    ["Vercel Analytics", "Vercel", "Optionale Analyse", "Aggregierte, cookie-freie Website-Analyse; vorsorglich hinter Analyse-Einwilligung.", "Aufbewahrung nach Vercel-Einstellungen."],
    ["Brevo Tracker", "Brevo", "Optionale Marketing-Automation", "Unterstuetzt spaetere E-Mail-Automation und Kampagnenmessung nach Einwilligung.", "Anbieterkennungen koennen variieren."],
    ["Brevo Conversations", "Brevo", "Optionaler Chat-Support", "Laedt das Chat-Widget nach Chat-Einwilligung.", "Anbieterkennungen koennen variieren."],
  ],
  fr: [
    ["esgcheck_cookie_consent_v1", "ESGCheck", "Essentiel", "Stocke les preferences de confidentialite dans localStorage.", "Jusqu'a modification, suppression ou remplacement par une nouvelle version."],
    ["Cloudflare Turnstile", "Cloudflare", "Securite essentielle", "Protege le formulaire contre le spam et les abus. Les identifiants et signaux du fournisseur peuvent varier.", "Charge uniquement pour ou pres du formulaire; conservation selon Cloudflare."],
    ["_ga, _ga_*", "Google Analytics", "Analyse optionnelle", "Aide a comprendre l'utilisation du site apres consentement.", "Generalement jusqu'a 2 ans selon les parametres Google."],
    ["Vercel Analytics", "Vercel", "Analyse optionnelle", "Analyse agregee sans cookies, soumise au consentement par prudence.", "Conservation selon les parametres Vercel."],
    ["Brevo Tracker", "Brevo", "Automatisation marketing optionnelle", "Soutient l'automatisation e-mail et la mesure de campagnes apres consentement.", "Les identifiants peuvent varier."],
    ["Brevo Conversations", "Brevo", "Chat optionnel", "Charge le widget de chat apres consentement.", "Les identifiants peuvent varier."],
  ],
  it: [
    ["esgcheck_cookie_consent_v1", "ESGCheck", "Essenziale", "Memorizza le preferenze privacy in localStorage.", "Fino a modifica, cancellazione o sostituzione con una nuova versione."],
    ["Cloudflare Turnstile", "Cloudflare", "Sicurezza essenziale", "Protegge il modulo da spam e abusi. Identificatori e segnali del provider possono variare.", "Caricato solo per o vicino al modulo; conservazione secondo Cloudflare."],
    ["_ga, _ga_*", "Google Analytics", "Analisi opzionale", "Aiuta a capire l'uso del sito dopo il consenso.", "Di norma fino a 2 anni, secondo le impostazioni Google."],
    ["Vercel Analytics", "Vercel", "Analisi opzionale", "Analisi aggregata senza cookie, comunque soggetta a consenso per cautela.", "Conservazione secondo le impostazioni Vercel."],
    ["Brevo Tracker", "Brevo", "Automazione marketing opzionale", "Supporta automazione email e misurazione campagne dopo il consenso.", "Gli identificatori possono variare."],
    ["Brevo Conversations", "Brevo", "Chat opzionale", "Carica il widget chat dopo il consenso.", "Gli identificatori possono variare."],
  ],
  rm: [
    ["esgcheck_cookie_consent_v1", "ESGCheck", "Essenzial", "Memorisescha preferenzas da protecziun da datas en localStorage.", "Enfin midada, stizzada u remplazzada cun ina nova versiun."],
    ["Cloudflare Turnstile", "Cloudflare", "Segirezza essenziala", "Protegia il formular cunter spam ed abus. Identificaturs e signals dal provider pon variar.", "Chargia mo per u datiers dal formular; retenziun tenor Cloudflare."],
    ["_ga, _ga_*", "Google Analytics", "Analisa opziunala", "Gida a chapir l'utilisaziun da la pagina suenter consentiment.", "Normalmain enfin 2 onns, tenor ils parameters da Google."],
    ["Vercel Analytics", "Vercel", "Analisa opziunala", "Analisa aggregada senza cookies; tuttina sut consentiment per precauziun.", "Retenziun tenor Vercel."],
    ["Brevo Tracker", "Brevo", "Automatisaziun da marketing opziunala", "Sustegna automatisaziun dad e-mail e mesiraziun da campanhas suenter consentiment.", "Identificaturs pon variar."],
    ["Brevo Conversations", "Brevo", "Chat opziunal", "Chargia il widget da chat suenter consentiment.", "Identificaturs pon variar."],
  ],
};

const sharedProviderList = ["Vercel", "Brevo", "Google Analytics", "Cloudflare Turnstile"];

export const legalContent: Record<Language, Record<LegalPageKind, LegalPageContent>> = {
  en: {
    privacy: {
      title: "Privacy Policy",
      description: "How ESGCheck handles personal data on this landing page.",
      updated,
      sections: [
        {
          title: "Controller and contact",
          paragraphs: [
            "ESGCheck is currently a non-incorporated project represented by Ali Priyatna, Sandackerstrasse 9, 9245 Oberbüren, Switzerland.",
            "For privacy requests or questions, contact info@esgcheck.ch. No data protection officer or EU representative has been appointed at this stage.",
          ],
        },
        {
          title: "Personal data we process",
          subsections: [
            {
              title: "Website and device data",
              paragraphs: ["Page views, browser information, IP-related technical data, and consent preferences."],
            },
            {
              title: "Waitlist data",
              paragraphs: ["Email address, language, newsletter consent, double opt-in status, timestamps, and Brevo form metadata."],
            },
            {
              title: "Contact emails",
              paragraphs: ["Emails and messages sent to ESGCheck."],
            },
            {
              title: "Chat messages",
              paragraphs: ["Chat messages and visitor information when the Brevo Conversations widget is enabled by consent."],
            },
            {
              title: "Security signals",
              paragraphs: ["Signals processed by Cloudflare Turnstile to protect the waitlist form from spam and abuse."],
            },
          ],
        },
        {
          title: "Purposes and legal bases",
          subsections: [
            {
              title: "Essential site operation",
              paragraphs: ["Language handling, consent storage, and form security are processed based on legitimate interests and, where applicable, necessity for a requested service."],
            },
            {
              title: "Newsletter and early access",
              paragraphs: ["Newsletter and early-access updates are based on consent given through the waitlist form and double opt-in flow."],
            },
            {
              title: "Analytics, marketing, and chat",
              paragraphs: ["Analytics, marketing automation, and chat support are based on consent through the privacy preferences banner."],
            },
            {
              title: "Responding to contact requests",
              paragraphs: ["Contact requests are processed for pre-contractual steps or legitimate interests in answering the request."],
            },
          ],
        },
        {
          title: "Processors and providers",
          paragraphs: [
            "ESGCheck uses external providers to host the site, process waitlist requests, protect the form, and provide optional analytics, marketing automation, and chat support.",
          ],
          list: sharedProviderList,
        },
        {
          title: "International transfers",
          paragraphs: [
            "Some providers may process data in Switzerland, the EU/EEA, the United States, or other countries. ESGCheck relies on provider contractual safeguards, data processing terms, and available transfer mechanisms where required.",
          ],
        },
        {
          title: "Retention",
          subsections: [
            {
              title: "Waitlist and newsletter data",
              paragraphs: ["Kept until you unsubscribe, withdraw consent, or the early-access purpose is no longer relevant."],
            },
            {
              title: "Contact emails",
              paragraphs: ["Kept as long as needed to answer and document the request."],
            },
            {
              title: "Consent preferences",
              paragraphs: ["Remain until changed, cleared in the browser, or replaced by a new consent version."],
            },
            {
              title: "Provider data",
              paragraphs: ["Analytics, chat, security, and marketing data follow provider settings and legal retention requirements."],
            },
          ],
        },
        {
          title: "Your rights",
          paragraphs: [
            "You may request access, correction, deletion, restriction, portability, objection, and withdrawal of consent. Withdrawal does not affect processing that happened before withdrawal.",
            "You may contact info@esgcheck.ch. In Switzerland, you may also contact the Federal Data Protection and Information Commissioner (FDPIC).",
          ],
        },
        {
          title: "Updates",
          paragraphs: [
            "ESGCheck may update this policy as the project, company structure, providers, or product scope mature.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookie Policy",
      description: "Cookies, local storage, and similar technologies used by ESGCheck.",
      updated,
      sections: [
        {
          title: "How we use cookies and similar technologies",
          paragraphs: [
            "Essential storage is used for privacy preferences and form security. Optional analytics, marketing automation, and chat support load only after consent.",
            "Provider cookie names and durations can change. ESGCheck should update this table after a production cookie scan.",
          ],
        },
        {
          title: "Current table",
          table: {
            headers: ["Name or service", "Provider", "Category", "Purpose", "Retention"],
            rows: cookieRows.en,
          },
        },
        {
          title: "Changing preferences",
          paragraphs: [
            "Use the Privacy preferences link in the footer to accept, reject, or change optional categories. Browser settings can also delete local storage and cookies.",
          ],
        },
      ],
    },
    legalNotice: {
      title: "Legal Notice",
      description: "Project identity, contact details, and legal disclaimer for ESGCheck.",
      updated,
      sections: [
        {
          title: "Project identity",
          paragraphs: [
            "ESGCheck is currently a non-incorporated project represented by Ali Priyatna.",
            "Address: Sandackerstrasse 9, 9245 Oberbüren, Switzerland. Contact: info@esgcheck.ch.",
          ],
        },
        {
          title: "Responsible for content",
          paragraphs: ["Ali Priyatna, Sandackerstrasse 9, 9245 Oberbüren, Switzerland."],
        },
        {
          title: "Disclaimer",
          paragraphs: [
            "ESGCheck content is provided for general information. It is not legal, audit, assurance, certification, financial, or investment advice.",
            "ESGCheck does not currently provide formal ESG assurance, certification, or full regulatory reporting support.",
          ],
        },
      ],
    },
  },
  de: {
    privacy: {
      title: "Datenschutzerklaerung",
      description: "Wie ESGCheck Personendaten auf dieser Landing Page bearbeitet.",
      updated,
      sections: [
        {
          title: "Verantwortlicher und Kontakt",
          paragraphs: [
            "ESGCheck ist derzeit ein nicht inkorporiertes Projekt, vertreten durch Ali Priyatna, Sandackerstrasse 9, 9245 Oberbüren, Schweiz.",
            "Fuer Datenschutzanfragen: info@esgcheck.ch. Es wurde derzeit kein Datenschutzbeauftragter und kein EU-Vertreter ernannt.",
          ],
        },
        {
          title: "Bearbeitete Personendaten",
          subsections: [
            {
              title: "Website- und Geraetedaten",
              paragraphs: ["Seitenaufrufe, Browserdaten, IP-bezogene technische Daten und Consent-Einstellungen."],
            },
            {
              title: "Wartelistendaten",
              paragraphs: ["E-Mail-Adresse, Sprache, Newsletter-Einwilligung, Double-Opt-in-Status, Zeitstempel und Brevo-Formulardaten."],
            },
            {
              title: "Kontakt-E-Mails",
              paragraphs: ["Kontakt-E-Mails und Nachrichten an ESGCheck."],
            },
            {
              title: "Chat-Nachrichten",
              paragraphs: ["Chat-Nachrichten und Besucherinformationen, wenn Brevo Conversations per Einwilligung aktiviert wird."],
            },
            {
              title: "Sicherheitssignale",
              paragraphs: ["Signale, die Cloudflare Turnstile zum Schutz des Formulars vor Spam und Missbrauch verarbeitet."],
            },
          ],
        },
        {
          title: "Zwecke und Rechtsgrundlagen",
          subsections: [
            {
              title: "Essenzieller Website-Betrieb",
              paragraphs: ["Sprache, Consent-Speicherung und Formularsicherheit beruhen auf berechtigten Interessen und, wo anwendbar, auf der Erforderlichkeit fuer einen gewuenschten Dienst."],
            },
            {
              title: "Newsletter und Early Access",
              paragraphs: ["Newsletter und Early-Access-Updates beruhen auf Einwilligung ueber Formular und Double-Opt-in."],
            },
            {
              title: "Analyse, Marketing und Chat",
              paragraphs: ["Analyse, Marketing-Automation und Chat beruhen auf Einwilligung ueber die Datenschutzeinstellungen."],
            },
            {
              title: "Beantwortung von Kontaktanfragen",
              paragraphs: ["Kontaktanfragen werden fuer vorvertragliche Schritte oder berechtigte Interessen bearbeitet."],
            },
          ],
        },
        { title: "Auftragsbearbeiter und Anbieter", paragraphs: ["ESGCheck nutzt externe Anbieter fuer Hosting, Warteliste, Formularschutz sowie optionale Analyse, Marketing-Automation und Chat."], list: sharedProviderList },
        { title: "Internationale Uebermittlungen", paragraphs: ["Einige Anbieter koennen Daten in der Schweiz, EU/EWR, den USA oder anderen Laendern bearbeiten. ESGCheck stuetzt sich, soweit erforderlich, auf vertragliche Schutzmechanismen und Datenverarbeitungsbedingungen der Anbieter."] },
        { title: "Aufbewahrung", subsections: [{ title: "Wartelisten- und Newsletterdaten", paragraphs: ["Bis Abmeldung, Widerruf oder Wegfall des Early-Access-Zwecks."] }, { title: "Kontakt-E-Mails", paragraphs: ["Solange noetig zur Beantwortung und Dokumentation."] }, { title: "Consent-Einstellungen", paragraphs: ["Bis zur Aenderung, Browser-Loeschung oder neuen Consent-Version."] }, { title: "Anbieterdaten", paragraphs: ["Analyse-, Chat-, Sicherheits- und Marketingdaten folgen Anbieter- und gesetzlichen Aufbewahrungsregeln."] }] },
        { title: "Ihre Rechte", paragraphs: ["Sie koennen Auskunft, Berichtigung, Loeschung, Einschraenkung, Datenuebertragbarkeit, Widerspruch und Widerruf der Einwilligung verlangen. Ein Widerruf wirkt nicht rueckwirkend.", "Kontakt: info@esgcheck.ch. In der Schweiz koennen Sie sich auch an den Eidgenoessischen Datenschutz- und Oeffentlichkeitsbeauftragten (EDOEB/FDPIC) wenden."] },
        { title: "Aktualisierungen", paragraphs: ["ESGCheck kann diese Erklaerung anpassen, wenn Projekt, Unternehmensstruktur, Anbieter oder Produktumfang reifen."] },
      ],
    },
    cookies: {
      title: "Cookie-Richtlinie",
      description: "Cookies, localStorage und aehnliche Technologien von ESGCheck.",
      updated,
      sections: [
        { title: "Einsatz", paragraphs: ["Essenzielle Speicherung dient Datenschutzeinstellungen und Formularsicherheit. Optionale Analyse, Marketing-Automation und Chat laden nur nach Einwilligung.", "Cookie-Namen und Laufzeiten von Anbietern koennen sich aendern. ESGCheck sollte diese Tabelle nach einem Produktionsscan aktualisieren."] },
        { title: "Aktuelle Tabelle", table: { headers: ["Name oder Dienst", "Anbieter", "Kategorie", "Zweck", "Aufbewahrung"], rows: cookieRows.de } },
        { title: "Einstellungen aendern", paragraphs: ["Nutzen Sie den Link Datenschutz-Einstellungen im Footer, um optionale Kategorien zu akzeptieren, abzulehnen oder zu aendern."] },
      ],
    },
    legalNotice: {
      title: "Impressum",
      description: "Projektidentitaet, Kontakt und Haftungshinweise fuer ESGCheck.",
      updated,
      sections: [
        { title: "Projektidentitaet", paragraphs: ["ESGCheck ist derzeit ein nicht inkorporiertes Projekt, vertreten durch Ali Priyatna.", "Adresse: Sandackerstrasse 9, 9245 Oberbüren, Schweiz. Kontakt: info@esgcheck.ch."] },
        { title: "Verantwortlich fuer Inhalte", paragraphs: ["Ali Priyatna, Sandackerstrasse 9, 9245 Oberbüren, Schweiz."] },
        { title: "Hinweis", paragraphs: ["Die Inhalte von ESGCheck dienen allgemeinen Informationszwecken. Sie sind keine Rechts-, Audit-, Assurance-, Zertifizierungs-, Finanz- oder Anlageberatung.", "ESGCheck bietet derzeit keine formale ESG-Assurance, Zertifizierung oder vollstaendige regulatorische Reporting-Unterstuetzung."] },
      ],
    },
  },
  fr: {
    privacy: {
      title: "Politique de confidentialite",
      description: "Comment ESGCheck traite les donnees personnelles sur cette landing page.",
      updated,
      sections: [
        { title: "Responsable et contact", paragraphs: ["ESGCheck est actuellement un projet non constitue en societe, represente par Ali Priyatna, Sandackerstrasse 9, 9245 Oberbüren, Suisse.", "Pour les demandes de confidentialite: info@esgcheck.ch. Aucun DPO ni representant UE n'est designe a ce stade."] },
        { title: "Donnees traitees", subsections: [{ title: "Donnees de site et d'appareil", paragraphs: ["Pages vues, navigateur, donnees techniques liees a l'IP et preferences de consentement."] }, { title: "Donnees de liste d'attente", paragraphs: ["E-mail, langue, consentement newsletter, double opt-in, horodatages et metadonnees Brevo."] }, { title: "E-mails de contact", paragraphs: ["E-mails et messages envoyes a ESGCheck."] }, { title: "Messages de chat", paragraphs: ["Messages de chat et informations visiteur si Brevo Conversations est active par consentement."] }, { title: "Signaux de securite", paragraphs: ["Signaux traites par Cloudflare Turnstile pour proteger le formulaire contre le spam et les abus."] }] },
        { title: "Finalites et bases juridiques", subsections: [{ title: "Fonctionnement essentiel du site", paragraphs: ["Langue, stockage du consentement et securite du formulaire reposent sur des interets legitimes et, le cas echeant, sur le service demande."] }, { title: "Newsletter et acces anticipe", paragraphs: ["Newsletter et acces anticipe reposent sur le consentement via formulaire et double opt-in."] }, { title: "Analyse, marketing et chat", paragraphs: ["Analyse, marketing automation et chat reposent sur le consentement via les preferences."] }, { title: "Reponse aux demandes", paragraphs: ["Les demandes sont traitees pour des mesures precontractuelles ou des interets legitimes."] }] },
        { title: "Prestataires", paragraphs: ["ESGCheck utilise des prestataires externes pour l'hebergement, la liste d'attente, la protection du formulaire et les services optionnels."], list: sharedProviderList },
        { title: "Transferts internationaux", paragraphs: ["Certains prestataires peuvent traiter des donnees en Suisse, dans l'UE/EEE, aux Etats-Unis ou ailleurs. ESGCheck s'appuie sur les garanties contractuelles et mecanismes disponibles lorsque necessaire."] },
        { title: "Conservation", subsections: [{ title: "Donnees de liste d'attente et newsletter", paragraphs: ["Conservees jusqu'au desabonnement, retrait du consentement ou fin de la finalite."] }, { title: "E-mails de contact", paragraphs: ["Conserves aussi longtemps que necessaire pour repondre et documenter la demande."] }, { title: "Preferences de consentement", paragraphs: ["Conservees jusqu'a modification, suppression dans le navigateur ou nouvelle version."] }, { title: "Donnees des prestataires", paragraphs: ["Les donnees d'analyse, chat, securite et marketing suivent les parametres des prestataires."] }] },
        { title: "Vos droits", paragraphs: ["Vous pouvez demander acces, rectification, suppression, limitation, portabilite, opposition et retrait du consentement. Le retrait n'est pas retroactif.", "Contact: info@esgcheck.ch. En Suisse, vous pouvez aussi contacter le PFPDT/FDPIC."] },
        { title: "Mises a jour", paragraphs: ["ESGCheck peut modifier cette politique lorsque le projet, la structure, les prestataires ou le produit evoluent."] },
      ],
    },
    cookies: { title: "Politique relative aux cookies", description: "Cookies, stockage local et technologies similaires utilises par ESGCheck.", updated, sections: [{ title: "Utilisation", paragraphs: ["Le stockage essentiel sert aux preferences de confidentialite et a la securite du formulaire. Les options d'analyse, marketing et chat ne se chargent qu'apres consentement.", "Les noms et durees peuvent changer; ESGCheck doit mettre a jour ce tableau apres un scan en production."] }, { title: "Tableau actuel", table: { headers: ["Nom ou service", "Prestataire", "Categorie", "Finalite", "Conservation"], rows: cookieRows.fr } }, { title: "Modifier les preferences", paragraphs: ["Utilisez le lien Preferences de confidentialite dans le footer pour modifier ou retirer votre consentement."] }] },
    legalNotice: { title: "Mentions legales", description: "Identite du projet, contact et clauses de non-responsabilite.", updated, sections: [{ title: "Identite du projet", paragraphs: ["ESGCheck est actuellement un projet non constitue en societe, represente par Ali Priyatna.", "Adresse: Sandackerstrasse 9, 9245 Oberbüren, Suisse. Contact: info@esgcheck.ch."] }, { title: "Responsable du contenu", paragraphs: ["Ali Priyatna, Sandackerstrasse 9, 9245 Oberbüren, Suisse."] }, { title: "Avertissement", paragraphs: ["Le contenu ESGCheck est fourni a titre informatif. Il ne constitue pas un conseil juridique, d'audit, d'assurance, de certification, financier ou d'investissement.", "ESGCheck ne fournit actuellement pas d'assurance ESG formelle, de certification ou de reporting reglementaire complet."] }] },
  },
  it: {
    privacy: {
      title: "Informativa privacy",
      description: "Come ESGCheck tratta i dati personali su questa landing page.",
      updated,
      sections: [
        { title: "Titolare e contatto", paragraphs: ["ESGCheck e attualmente un progetto non incorporato, rappresentato da Ali Priyatna, Sandackerstrasse 9, 9245 Oberbüren, Svizzera.", "Per richieste privacy: info@esgcheck.ch. Non e stato nominato un DPO o rappresentante UE in questa fase."] },
        { title: "Dati trattati", subsections: [{ title: "Dati di sito e dispositivo", paragraphs: ["Pagine viste, browser, dati tecnici legati all'IP e preferenze di consenso."] }, { title: "Dati lista d'attesa", paragraphs: ["Email, lingua, consenso newsletter, double opt-in, timestamp e metadati Brevo."] }, { title: "Email di contatto", paragraphs: ["Email e messaggi inviati a ESGCheck."] }, { title: "Messaggi chat", paragraphs: ["Messaggi chat e informazioni visitatore se Brevo Conversations e attivato con consenso."] }, { title: "Segnali di sicurezza", paragraphs: ["Segnali trattati da Cloudflare Turnstile per proteggere il modulo da spam e abusi."] }] },
        { title: "Finalita e basi giuridiche", subsections: [{ title: "Funzionamento essenziale del sito", paragraphs: ["Lingua, consenso e sicurezza modulo si basano su interessi legittimi e, ove applicabile, sul servizio richiesto."] }, { title: "Newsletter e accesso anticipato", paragraphs: ["Newsletter e accesso anticipato si basano sul consenso tramite modulo e double opt-in."] }, { title: "Analisi, marketing e chat", paragraphs: ["Analisi, marketing automation e chat si basano sul consenso tramite preferenze."] }, { title: "Risposta a richieste", paragraphs: ["Le richieste sono trattate per misure precontrattuali o interessi legittimi."] }] },
        { title: "Fornitori", paragraphs: ["ESGCheck usa fornitori esterni per hosting, lista d'attesa, protezione modulo e servizi opzionali."], list: sharedProviderList },
        { title: "Trasferimenti internazionali", paragraphs: ["Alcuni fornitori possono trattare dati in Svizzera, UE/SEE, Stati Uniti o altri paesi. ESGCheck si affida a garanzie contrattuali e meccanismi disponibili quando necessario."] },
        { title: "Conservazione", subsections: [{ title: "Dati lista d'attesa e newsletter", paragraphs: ["Conservati fino a disiscrizione, revoca o fine della finalita."] }, { title: "Email di contatto", paragraphs: ["Conservate quanto necessario per rispondere e documentare la richiesta."] }, { title: "Preferenze consenso", paragraphs: ["Conservate fino a modifica, cancellazione nel browser o nuova versione."] }, { title: "Dati dei fornitori", paragraphs: ["Dati analytics, chat, sicurezza e marketing seguono le impostazioni dei fornitori."] }] },
        { title: "Diritti", paragraphs: ["Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilita, opposizione e revoca del consenso. La revoca non e retroattiva.", "Contatto: info@esgcheck.ch. In Svizzera puoi anche contattare l'FDPIC."] },
        { title: "Aggiornamenti", paragraphs: ["ESGCheck puo aggiornare questa informativa quando progetto, struttura, fornitori o prodotto evolvono."] },
      ],
    },
    cookies: { title: "Informativa sui cookie", description: "Cookie, localStorage e tecnologie simili usate da ESGCheck.", updated, sections: [{ title: "Uso", paragraphs: ["Lo storage essenziale serve per preferenze privacy e sicurezza del modulo. Analisi, marketing e chat opzionali si caricano solo dopo consenso.", "Nomi e durate possono cambiare; ESGCheck deve aggiornare la tabella dopo uno scan in produzione."] }, { title: "Tabella attuale", table: { headers: ["Nome o servizio", "Fornitore", "Categoria", "Finalita", "Conservazione"], rows: cookieRows.it } }, { title: "Modificare preferenze", paragraphs: ["Usa il link Preferenze privacy nel footer per modificare o ritirare il consenso."] }] },
    legalNotice: { title: "Note legali", description: "Identita del progetto, contatti e disclaimer.", updated, sections: [{ title: "Identita del progetto", paragraphs: ["ESGCheck e attualmente un progetto non incorporato, rappresentato da Ali Priyatna.", "Indirizzo: Sandackerstrasse 9, 9245 Oberbüren, Svizzera. Contatto: info@esgcheck.ch."] }, { title: "Responsabile dei contenuti", paragraphs: ["Ali Priyatna, Sandackerstrasse 9, 9245 Oberbüren, Svizzera."] }, { title: "Disclaimer", paragraphs: ["I contenuti ESGCheck sono informativi e non costituiscono consulenza legale, audit, assurance, certificazione, finanziaria o d'investimento.", "ESGCheck non fornisce attualmente assurance ESG formale, certificazione o reporting regolamentare completo."] }] },
  },
  rm: {
    privacy: {
      title: "Decleraziun da protecziun da datas",
      description: "Co ESGCheck tracta datas persunalas sin questa landing page.",
      updated,
      sections: [
        { title: "Responsabel e contact", paragraphs: ["ESGCheck è actualmain in project betg incorporà, represchentà dad Ali Priyatna, Sandackerstrasse 9, 9245 Oberbüren, Svizra.", "Per dumondas da protecziun da datas: info@esgcheck.ch. Nagina persuna DPO u represchentanza UE n'è nominada en questa fasa."] },
        { title: "Datas tractadas", subsections: [{ title: "Datas da pagina e dispositiv", paragraphs: ["Visitas da paginas, browser, datas tecnicas colliadas cun IP e preferenzas da consentiment."] }, { title: "Datas da glista da spetga", paragraphs: ["E-mail, lingua, consentiment newsletter, double opt-in, timestamps e metadata da Brevo."] }, { title: "E-mails da contact", paragraphs: ["E-mails e messadis tramess ad ESGCheck."] }, { title: "Messadis da chat", paragraphs: ["Messadis da chat ed infurmaziuns da visitaders sche Brevo Conversations vegn activà cun consentiment."] }, { title: "Signals da segirezza", paragraphs: ["Signals tractads da Cloudflare Turnstile per proteger il formular cunter spam ed abus."] }] },
        { title: "Intents e basas legalas", subsections: [{ title: "Funcziun essenziala da la pagina", paragraphs: ["Lingua, consentiment e segirezza dal formular sa basan sin interess legitim e, nua applicabel, sin il servetsch dumandà."] }, { title: "Newsletter ed access anticipà", paragraphs: ["Newsletter ed access anticipà sa basan sin consentiment via formular e double opt-in."] }, { title: "Analisa, marketing e chat", paragraphs: ["Analisa, marketing e chat sa basan sin consentiment via preferenzas."] }, { title: "Respunder a dumondas", paragraphs: ["Dumondas vegnan tractadas per pass precontractuals u interess legitim."] }] },
        { title: "Providers", paragraphs: ["ESGCheck dovra providers externs per hosting, glista da spetga, protecziun dal formular e servetschs opziunals."], list: sharedProviderList },
        { title: "Transfer internaziunal", paragraphs: ["Tscherts providers pon tractar datas en Svizra, UE/SEE, Stadis Unids u auters pajais. ESGCheck sa basa sin garanzias contractualas e mecanissems disponibels nua necessari."] },
        { title: "Retenziun", subsections: [{ title: "Datas da glista da spetga e newsletter", paragraphs: ["Enfin desabunament, revocaziun u fin da l'intent."] }, { title: "E-mails da contact", paragraphs: ["Tegnids uschè ditg sco necessari per respunder e documentar la dumonda."] }, { title: "Preferenzas da consentiment", paragraphs: ["Enfin midada, stizzada en il browser u nova versiun."] }, { title: "Datas dals providers", paragraphs: ["Datas d'analisa, chat, segirezza e marketing suondan ils parameters dals providers."] }] },
        { title: "Voss dretgs", paragraphs: ["Vus pudais dumandar access, correctura, stizzada, limitaziun, portabilitad, protesta e revocaziun dal consentiment. La revocaziun na vala betg retroactivamain.", "Contact: info@esgcheck.ch. En Svizra pudais Vus era contactar il FDPIC/EDOEB."] },
        { title: "Actualisaziuns", paragraphs: ["ESGCheck po actualisar questa decleraziun sche project, structura, providers u product sa sviluppan."] },
      ],
    },
    cookies: { title: "Politica da cookies", description: "Cookies, localStorage e tecnologias sumegliantas duvradas dad ESGCheck.", updated, sections: [{ title: "Utilisaziun", paragraphs: ["Memorisaziun essenziala serva a preferenzas da datas e segirezza dal formular. Analisa, marketing e chat opziunals vegnan chargiads mo suenter consentiment.", "Nums e duradas pon midar; ESGCheck duai actualisar la tabella suenter in scan da producziun."] }, { title: "Tabella actuala", table: { headers: ["Num u servetsch", "Provider", "Categoria", "Intent", "Retenziun"], rows: cookieRows.rm } }, { title: "Midar preferenzas", paragraphs: ["Duvrai il link Preferenzas da protecziun da datas en il footer per midar u revocar il consentiment."] }] },
    legalNotice: { title: "Impressum", description: "Identitad dal project, contact e renviaments legals.", updated, sections: [{ title: "Identitad dal project", paragraphs: ["ESGCheck è actualmain in project betg incorporà, represchentà dad Ali Priyatna.", "Adressa: Sandackerstrasse 9, 9245 Oberbüren, Svizra. Contact: info@esgcheck.ch."] }, { title: "Responsabel per cuntegn", paragraphs: ["Ali Priyatna, Sandackerstrasse 9, 9245 Oberbüren, Svizra."] }, { title: "Renviament", paragraphs: ["Il cuntegn dad ESGCheck e infurmativ e n'e betg cussegliaziun legala, audit, assurance, certificaziun, finanziala u d'investiziun.", "ESGCheck na porscha actualmain betg assurance ESG formala, certificaziun u sustegn cumplet da reporting regulatoric."] }] },
  },
};


