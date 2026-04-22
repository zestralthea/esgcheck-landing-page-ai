import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "de" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    const translations = getTranslations(language);
    return getNestedValue(translations, key) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const getNestedValue = (obj: Record<string, unknown>, path: string): string | undefined => {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof value === "string" ? value : undefined;
};

const getTranslations = (lang: Language) => {
  switch (lang) {
    case "de":
      return deTranslations;
    case "fr":
      return frTranslations;
    case "en":
    default:
      return enTranslations;
  }
};

const enTranslations = {
  header: {
    features: "Features",
    about: "About",
    joinWaitlist: "Request Early Access"
  },
  hero: {
    title: "Understand where you stand on",
    titleHighlight: "ESG",
    description: "Turn the policies, internal records, and company reports you already have into a credible first ESG assessment - with a clear score, visible gaps, and practical next steps.",
    joinWaitlist: "Request Early Access",
    uploadAnalyze: "Upload. Analyze. Improve.",
    resultsTime: "Structured output from your existing documents.",
    frameworks: "GRI-first foundation, broader framework coverage evolving over time."
  },
  features: {
    title: "Get ESG clarity - without the complexity",
    subtitle: "ESGCheck turns the documents growing SMEs already have into a structured first ESG view.",
    subtitleTwo: "No heavy advisory process, no months of back-and-forth.",
    score: {
      title: "A clear first score",
      description: "Get a structured ESG score grounded in your own documents, with the reasoning behind it."
    },
    risks: {
      title: "See where your gaps are",
      description: "Identify missing or insufficient evidence in the areas that matter most to customers, partners, and lenders."
    },
    suggestions: {
      title: "Practical next steps, not abstract advice",
      description: "Clear recommendations on what to improve next, based on what your documents do and do not show."
    },
    summary: {
      title: "A shareable summary for your team",
      description: "Export a clean overview you can bring to leadership, finance, and key stakeholders."
    },
    upload: {
      title: "Document-first workflow",
      description: "Start from policies, internal records, and company reports - no new data collection needed to get a first view."
    },
    trust: {
      frameworks: "GRI-first foundation",
      frameworksDesc: "Broader SME-relevant and Swiss/EU-aligned framework coverage planned over time.",
      audit: "Not assurance or certification - a credible first assessment",
      auditDesc: "Built to help you orient yourself and decide what to do next.",
      security: "Privacy-conscious, Swiss-built",
      securityDesc: "Designed around Swiss and EU expectations for handling sensitive company material; your data is never used to train models."
    }
  },
  about: {
    title: "Why we are building ESGCheck",
    description: "Growing SMEs are facing ESG questions from customers, procurement teams, lenders, and investors before formal obligations always apply. Traditional ESG work can still feel too expensive and complex for smaller companies that need a practical way to understand where they stand.",
    team: "We are a small, Swiss-based team building a practical ESG assessment for growing SMEs - founders, managing directors, and finance leads facing rising ESG expectations from customers, partners, lenders, and investors.",
    clarity: {
      title: "Clarity over Complexity",
      description: "We turn dense ESG data into simple, actionable insights."
    },
    improving: {
      title: "Credible starting point",
      description: "A structured first view today, with stronger, expert-validated workflows coming as the product matures."
    },
    secure: {
      title: "Privacy-conscious by design",
      description: "GRI-first methodology. Built in Switzerland with privacy and trust at the core."
    }
  },
  waitlist: {
    title: "See where you stand on ESG",
    description: "Join the early access group and help us validate a practical first ESG assessment for growing SMEs - built in Switzerland.",
    cardTitle: "Get Early Access to ESGCheck",
    ctaButton: "Email Us for Early Access",
    emailNote: "Tell us about your company and what ESG reporting challenge you want to solve. We will reply with beta access details.",
    modal: {
      disclaimer: "Free during beta - no credit card - privacy respected",
      betaNote: "Early testers get free access and help us build ESGCheck into the tool you need."
    }
  },
  footer: {
    description: "ESGCheck turns the documents growing SMEs already have into a credible first ESG assessment - built in Switzerland.",
    product: "Product",
    company: "Company",
    copyright: "Copyright 2026 ESGCheck. All rights reserved."
  }
};

const deTranslations = {
  header: {
    features: "Funktionen",
    about: "Ueber uns",
    joinWaitlist: "Early Access anfragen"
  },
  hero: {
    title: "Verstehen Sie, wo Sie bei",
    titleHighlight: "ESG stehen",
    description: "Machen Sie aus vorhandenen Richtlinien, internen Unterlagen und Unternehmensberichten eine glaubwuerdige erste ESG-Einschaetzung - mit klarer Bewertung, sichtbaren Luecken und praktischen naechsten Schritten.",
    joinWaitlist: "Early Access anfragen",
    uploadAnalyze: "Hochladen. Analysieren. Verbessern.",
    resultsTime: "Strukturierte Ergebnisse aus Ihren vorhandenen Dokumenten.",
    frameworks: "GRI-Basis, breitere Framework-Abdeckung entsteht schrittweise."
  },
  features: {
    title: "ESG-Klarheit - ohne Komplexitaet",
    subtitle: "ESGCheck macht aus den vorhandenen Dokumenten wachsender KMU eine strukturierte erste ESG-Sicht.",
    subtitleTwo: "Kein schwerfaelliger Beratungsprozess, kein monatelanges Hin und Her.",
    score: {
      title: "Eine klare erste Bewertung",
      description: "Erhalten Sie eine strukturierte ESG-Bewertung auf Basis Ihrer eigenen Dokumente, inklusive Begruendung."
    },
    risks: {
      title: "Sehen Sie, wo Luecken bestehen",
      description: "Erkennen Sie fehlende oder unzureichende Nachweise in den Bereichen, die fuer Kunden, Partner und Kreditgeber besonders wichtig sind."
    },
    suggestions: {
      title: "Praktische naechste Schritte statt abstrakter Ratschlaege",
      description: "Klare Empfehlungen, was Sie als Naechstes verbessern koennen - basierend darauf, was Ihre Dokumente zeigen und was noch fehlt."
    },
    summary: {
      title: "Eine teilbare Zusammenfassung fuer Ihr Team",
      description: "Exportieren Sie eine klare Uebersicht fuer Geschaeftsleitung, Finanzen und wichtige Stakeholder."
    },
    upload: {
      title: "Dokumentenbasierter Workflow",
      description: "Starten Sie mit Richtlinien, internen Unterlagen und Unternehmensberichten - ohne neue Datenerhebung fuer eine erste Sicht."
    },
    trust: {
      frameworks: "GRI-Basis",
      frameworksDesc: "Breitere KMU-relevante und Swiss/EU-ausgerichtete Framework-Abdeckung ist ueber die Zeit geplant.",
      audit: "Keine Assurance oder Zertifizierung - eine glaubwuerdige erste Einschaetzung",
      auditDesc: "Entwickelt, damit Sie sich orientieren und naechste Schritte entscheiden koennen.",
      security: "Datenschutzbewusst, in der Schweiz gebaut",
      securityDesc: "Ausgerichtet auf Schweizer und EU-Erwartungen im Umgang mit sensiblen Unternehmensunterlagen; Ihre Daten werden nie zum Training von Modellen genutzt."
    }
  },
  about: {
    title: "Warum wir ESGCheck entwickeln",
    description: "Wachsende KMU werden von Kunden, Einkaufsteams, Kreditgebern und Investoren nach ESG gefragt, oft bevor formale Pflichten greifen. Klassische ESG-Arbeit wirkt fuer kleinere Unternehmen dennoch haeufig zu teuer und zu komplex, obwohl sie eine praktische Orientierung brauchen.",
    team: "Wir sind ein kleines Team aus der Schweiz und bauen eine praktische ESG-Einschaetzung fuer wachsende KMU - Gruender, Geschaeftsfuehrende und Finanzverantwortliche, die steigenden ESG-Erwartungen von Kunden, Partnern, Kreditgebern und Investoren begegnen.",
    clarity: {
      title: "Klarheit statt Komplexitaet",
      description: "Wir verwandeln dichte ESG-Daten in einfache, umsetzbare Einblicke."
    },
    improving: {
      title: "Glaubwuerdiger Startpunkt",
      description: "Eine strukturierte erste Sicht heute, mit staerkeren, expertengestuetzten Workflows, wenn das Produkt reift."
    },
    secure: {
      title: "Datenschutzbewusst von Anfang an",
      description: "GRI-first Methodik. In der Schweiz gebaut, mit Datenschutz und Vertrauen im Zentrum."
    }
  },
  waitlist: {
    title: "Sehen Sie, wo Sie bei ESG stehen",
    description: "Werden Sie Teil der Early-Access-Gruppe und helfen Sie uns, eine praktische erste ESG-Einschaetzung fuer wachsende KMU zu validieren - gebaut in der Schweiz.",
    cardTitle: "Early Access fuer ESGCheck",
    ctaButton: "Early Access per E-Mail anfragen",
    emailNote: "Erzaehlen Sie uns kurz von Ihrem Unternehmen und Ihrer ESG-Herausforderung. Wir melden uns mit Details zum Beta-Zugang.",
    modal: {
      disclaimer: "Kostenlos waehrend der Beta - keine Kreditkarte - Datenschutz respektiert",
      betaNote: "Fruehe Tester erhalten kostenlosen Zugang und helfen uns, ESGCheck zum passenden Werkzeug zu machen."
    }
  },
  footer: {
    description: "ESGCheck macht aus den vorhandenen Dokumenten wachsender KMU eine glaubwuerdige erste ESG-Einschaetzung - gebaut in der Schweiz.",
    product: "Produkt",
    company: "Unternehmen",
    copyright: "Copyright 2026 ESGCheck. Alle Rechte vorbehalten."
  }
};

const frTranslations = {
  header: {
    features: "Fonctionnalites",
    about: "A propos",
    joinWaitlist: "Demander un acces"
  },
  hero: {
    title: "Comprendre ou vous en etes sur",
    titleHighlight: "l'ESG",
    description: "Transformez les politiques, documents internes et rapports d'entreprise que vous avez deja en une premiere evaluation ESG credible - avec un score clair, des lacunes visibles et des prochaines etapes pratiques.",
    joinWaitlist: "Demander un acces",
    uploadAnalyze: "Telecharger. Analyser. Ameliorer.",
    resultsTime: "Resultat structure a partir de vos documents existants.",
    frameworks: "Base GRI d'abord, avec une couverture plus large qui evolue dans le temps."
  },
  features: {
    title: "Obtenez de la clarte ESG - sans complexite",
    subtitle: "ESGCheck transforme les documents que les PME en croissance possedent deja en une premiere vue ESG structuree.",
    subtitleTwo: "Pas de processus de conseil lourd, pas de longs allers-retours.",
    score: {
      title: "Un premier score clair",
      description: "Obtenez un score ESG structure fonde sur vos propres documents, avec le raisonnement qui l'explique."
    },
    risks: {
      title: "Voyez ou sont vos lacunes",
      description: "Identifiez les preuves manquantes ou insuffisantes dans les domaines qui comptent le plus pour vos clients, partenaires et preteurs."
    },
    suggestions: {
      title: "Des prochaines etapes pratiques, pas des conseils abstraits",
      description: "Des recommandations claires sur ce qu'il faut ameliorer ensuite, selon ce que vos documents montrent ou ne montrent pas."
    },
    summary: {
      title: "Un resume partageable pour votre equipe",
      description: "Exportez une vue d'ensemble claire pour la direction, la finance et les parties prenantes cles."
    },
    upload: {
      title: "Un workflow centre sur les documents",
      description: "Commencez avec vos politiques, documents internes et rapports d'entreprise - sans nouvelle collecte de donnees pour obtenir une premiere vue."
    },
    trust: {
      frameworks: "Base GRI d'abord",
      frameworksDesc: "Une couverture plus large, adaptee aux PME et alignee avec la Suisse et l'UE, est prevue dans le temps.",
      audit: "Ni assurance ni certification - une premiere evaluation credible",
      auditDesc: "Concu pour vous aider a vous orienter et a decider quoi faire ensuite.",
      security: "Confidentialite integree, construit en Suisse",
      securityDesc: "Pense autour des attentes suisses et europeennes pour le traitement de documents d'entreprise sensibles; vos donnees ne servent jamais a entrainer des modeles."
    }
  },
  about: {
    title: "Pourquoi nous construisons ESGCheck",
    description: "Les PME en croissance recoivent des questions ESG de clients, d'equipes achats, de preteurs et d'investisseurs avant meme que des obligations formelles ne s'appliquent. Le travail ESG traditionnel reste souvent trop couteux et trop complexe pour les petites entreprises qui ont besoin d'une orientation pratique.",
    team: "Nous sommes une petite equipe basee en Suisse et nous construisons une evaluation ESG pratique pour les PME en croissance - fondateurs, directions generales et responsables finance confrontes aux attentes ESG croissantes de clients, partenaires, preteurs et investisseurs.",
    clarity: {
      title: "Clarte plutot que complexite",
      description: "Nous transformons des donnees ESG denses en informations simples et exploitables."
    },
    improving: {
      title: "Un point de depart credible",
      description: "Une premiere vue structuree aujourd'hui, avec des workflows plus solides et valides par des experts a mesure que le produit murit."
    },
    secure: {
      title: "Confidentialite par conception",
      description: "Methodologie GRI-first. Construit en Suisse avec confidentialite et confiance au coeur du produit."
    }
  },
  waitlist: {
    title: "Voyez ou vous en etes sur l'ESG",
    description: "Rejoignez le groupe d'acces anticipe et aidez-nous a valider une premiere evaluation ESG pratique pour les PME en croissance - construite en Suisse.",
    cardTitle: "Obtenir un acces anticipe a ESGCheck",
    ctaButton: "Nous ecrire pour un acces anticipe",
    emailNote: "Decrivez votre entreprise et votre principal defi ESG. Nous repondrons avec les details de la beta.",
    modal: {
      disclaimer: "Gratuit pendant la beta - aucune carte bancaire - confidentialite respectee",
      betaNote: "Les premiers testeurs obtiennent un acces gratuit et nous aident a ameliorer ESGCheck."
    }
  },
  footer: {
    description: "ESGCheck transforme les documents que les PME en croissance possedent deja en une premiere evaluation ESG credible - construite en Suisse.",
    product: "Produit",
    company: "Entreprise",
    copyright: "Copyright 2026 ESGCheck. Tous droits reserves."
  }
};
