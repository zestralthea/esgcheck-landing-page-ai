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
    title: "Make ESG Progress",
    titleHighlight: "Visible",
    description: "Upload your sustainability report and get instant, AI-powered insights. We help you spot gaps, improve alignment with global frameworks, and stay on track with clarity, not complexity.",
    joinWaitlist: "Request Early Access",
    uploadAnalyze: "Upload. Analyze. Improve.",
    resultsTime: "Results in under 2 minutes",
    frameworks: "Built on trusted frameworks (GRI, CSRD)"
  },
  features: {
    title: "Get ESG clarity - without the complexity",
    subtitle: "ESGCheck gives you instant, actionable insights from your sustainability reports.",
    subtitleTwo: "No consultants, no spreadsheets, no waiting weeks for feedback.",
    score: {
      title: "A simple score that shows where you stand",
      description: "Get an instant ESG performance score that is easy to understand and benchmark against industry standards."
    },
    risks: {
      title: "Spot risks before investors or regulators do",
      description: "Identify compliance gaps and potential issues before they become costly problems or regulatory violations."
    },
    suggestions: {
      title: "AI-generated suggestions tailored to your report",
      description: "Receive specific, actionable recommendations based on your actual data and industry best practices."
    },
    summary: {
      title: "A clean summary PDF you can share with your team",
      description: "Export professional reports that communicate your ESG progress clearly to stakeholders and leadership."
    },
    upload: {
      title: "Upload once, get insights in minutes",
      description: "Transform weeks of analysis into minutes. Just upload your report and get comprehensive insights instantly."
    },
    trust: {
      frameworks: "Built on global ESG frameworks like GRI and CSRD",
      frameworksDesc: "Industry-standard compliance foundation",
      audit: "Not a certified audit, but your smartest first step toward one",
      auditDesc: "Prepare confidently for formal assessments",
      security: "Your data is never used to train models and stays secure",
      securityDesc: "Complete privacy and data protection"
    }
  },
  about: {
    title: "Why we are building ESGCheck",
    description: "We believe ESG transparency should be fast, accessible, and practical, not just reserved for large corporations with audit budgets. ESGCheck gives companies an easy starting point to track their environmental, social, and governance performance in real time, and improve over time.",
    team: "We are a small, Swiss-based team using AI to bring ESG clarity to those who need it most: growing businesses, consultants, and early-stage sustainability teams.",
    clarity: {
      title: "Clarity over Complexity",
      description: "We turn dense ESG data into simple, actionable insights."
    },
    improving: {
      title: "Always Improving",
      description: "Use ESGCheck before, between, or even without formal audits to keep progress on track."
    },
    secure: {
      title: "Secure and Trustworthy",
      description: "Built on global frameworks (GRI, CSRD). Your data is always private."
    }
  },
  waitlist: {
    title: "Ready to Take the First Step Toward Real ESG Progress?",
    description: "Be one of the first to try our AI-powered ESG health check. Upload your report, get actionable insights, and help us build something truly useful.",
    cardTitle: "Get Early Access to ESGCheck",
    ctaButton: "Email Us for Early Access",
    emailNote: "Tell us about your company and what ESG reporting challenge you want to solve. We will reply with beta access details.",
    modal: {
      disclaimer: "Free during beta - no credit card - privacy respected",
      betaNote: "Early testers get free access and help us build ESGCheck into the tool you need."
    }
  },
  footer: {
    description: "ESGCheck helps businesses make sense of their ESG reports with AI-powered insights and guidance, in minutes.",
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
    title: "ESG-Fortschritt",
    titleHighlight: "sichtbar machen",
    description: "Laden Sie Ihren Nachhaltigkeitsbericht hoch und erhalten Sie sofortige, KI-gestuetzte Einblicke. Wir helfen Ihnen, Luecken zu erkennen, die Ausrichtung an globalen Frameworks zu verbessern und mit Klarheit auf Kurs zu bleiben.",
    joinWaitlist: "Early Access anfragen",
    uploadAnalyze: "Hochladen. Analysieren. Verbessern.",
    resultsTime: "Ergebnisse in unter 2 Minuten",
    frameworks: "Basiert auf vertrauten Frameworks (GRI, CSRD)"
  },
  features: {
    title: "ESG-Klarheit - ohne Komplexitaet",
    subtitle: "ESGCheck liefert sofortige, umsetzbare Einblicke aus Ihren Nachhaltigkeitsberichten.",
    subtitleTwo: "Keine Berater, keine Tabellen, kein wochenlanges Warten auf Feedback.",
    score: {
      title: "Eine einfache Bewertung, die zeigt, wo Sie stehen",
      description: "Erhalten Sie sofort eine ESG-Leistungsbewertung, die leicht zu verstehen ist und mit Branchenstandards verglichen werden kann."
    },
    risks: {
      title: "Risiken erkennen, bevor Investoren oder Regulatoren es tun",
      description: "Identifizieren Sie Compliance-Luecken und potenzielle Probleme, bevor sie kostspielig werden."
    },
    suggestions: {
      title: "KI-generierte Vorschlaege fuer Ihren Bericht",
      description: "Erhalten Sie konkrete Empfehlungen basierend auf Ihren Daten und etablierten Best Practices."
    },
    summary: {
      title: "Eine klare Zusammenfassung fuer Ihr Team",
      description: "Teilen Sie ESG-Fortschritt verstaendlich mit Stakeholdern und Fuehrungskraeften."
    },
    upload: {
      title: "Einmal hochladen, Einblicke in Minuten erhalten",
      description: "Verwandeln Sie wochenlange Analyse in Minuten. Laden Sie Ihren Bericht hoch und erhalten Sie sofort umfassende Einblicke."
    },
    trust: {
      frameworks: "Basiert auf globalen ESG-Frameworks wie GRI und CSRD",
      frameworksDesc: "Branchenstandard als Grundlage",
      audit: "Kein zertifiziertes Audit, aber ein starker erster Schritt",
      auditDesc: "Bereiten Sie sich sicher auf formale Bewertungen vor",
      security: "Ihre Daten werden niemals zum Training von Modellen verwendet",
      securityDesc: "Datenschutz und Privatsphaere bleiben zentral"
    }
  },
  about: {
    title: "Warum wir ESGCheck entwickeln",
    description: "Wir glauben, dass ESG-Transparenz schnell, zugaenglich und praktisch sein sollte. ESGCheck gibt Unternehmen einen einfachen Startpunkt, um Umwelt-, Sozial- und Governance-Leistung besser zu verstehen und zu verbessern.",
    team: "Wir sind ein kleines Team aus der Schweiz und nutzen KI, um ESG-Klarheit fuer wachsende Unternehmen, Berater und Nachhaltigkeitsteams einfacher erreichbar zu machen.",
    clarity: {
      title: "Klarheit statt Komplexitaet",
      description: "Wir verwandeln dichte ESG-Daten in einfache, umsetzbare Einblicke."
    },
    improving: {
      title: "Kontinuierlich besser",
      description: "Nutzen Sie ESGCheck vor, zwischen oder auch ohne formale Audits, um Fortschritt im Blick zu behalten."
    },
    secure: {
      title: "Sicher und vertrauenswuerdig",
      description: "Basiert auf globalen Frameworks (GRI, CSRD). Ihre Daten bleiben privat."
    }
  },
  waitlist: {
    title: "Bereit fuer den ersten Schritt zu echtem ESG-Fortschritt?",
    description: "Testen Sie frueh unseren KI-gestuetzten ESG Health Check. Laden Sie Ihren Bericht hoch, erhalten Sie umsetzbare Einblicke und helfen Sie uns, ein wirklich nuetzliches Produkt zu bauen.",
    cardTitle: "Early Access fuer ESGCheck",
    ctaButton: "Early Access per E-Mail anfragen",
    emailNote: "Erzaehlen Sie uns kurz von Ihrem Unternehmen und Ihrer ESG-Herausforderung. Wir melden uns mit Details zum Beta-Zugang.",
    modal: {
      disclaimer: "Kostenlos waehrend der Beta - keine Kreditkarte - Datenschutz respektiert",
      betaNote: "Fruehe Tester erhalten kostenlosen Zugang und helfen uns, ESGCheck zum passenden Werkzeug zu machen."
    }
  },
  footer: {
    description: "ESGCheck hilft Unternehmen, ESG-Berichte mit KI-gestuetzten Einblicken und klarer Orientierung in Minuten zu verstehen.",
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
    title: "Rendre les progres ESG",
    titleHighlight: "visibles",
    description: "Telechargez votre rapport de durabilite et obtenez des informations instantanees alimentees par l'IA. Nous vous aidons a reperer les lacunes, ameliorer l'alignement avec les cadres mondiaux et avancer avec clarte.",
    joinWaitlist: "Demander un acces",
    uploadAnalyze: "Telecharger. Analyser. Ameliorer.",
    resultsTime: "Resultats en moins de 2 minutes",
    frameworks: "Base sur des cadres fiables (GRI, CSRD)"
  },
  features: {
    title: "Obtenez de la clarte ESG - sans complexite",
    subtitle: "ESGCheck fournit des informations instantanees et exploitables a partir de vos rapports de durabilite.",
    subtitleTwo: "Pas de consultants, pas de feuilles de calcul, pas d'attente de plusieurs semaines.",
    score: {
      title: "Un score simple qui montre ou vous en etes",
      description: "Obtenez un score ESG facile a comprendre et a comparer aux standards du marche."
    },
    risks: {
      title: "Reperez les risques avant les investisseurs ou regulateurs",
      description: "Identifiez les lacunes et les problemes potentiels avant qu'ils ne deviennent couteux."
    },
    suggestions: {
      title: "Suggestions IA adaptees a votre rapport",
      description: "Recevez des recommandations concretes basees sur vos donnees et les meilleures pratiques."
    },
    summary: {
      title: "Un resume clair a partager avec votre equipe",
      description: "Communiquez vos progres ESG clairement aux parties prenantes et a la direction."
    },
    upload: {
      title: "Telechargez une fois, obtenez des informations en minutes",
      description: "Transformez des semaines d'analyse en quelques minutes avec un rapport facile a lire."
    },
    trust: {
      frameworks: "Base sur les cadres ESG mondiaux comme GRI et CSRD",
      frameworksDesc: "Une fondation conforme aux standards du secteur",
      audit: "Pas un audit certifie, mais une premiere etape utile",
      auditDesc: "Preparez-vous plus sereinement aux evaluations formelles",
      security: "Vos donnees ne servent jamais a entrainer des modeles",
      securityDesc: "Confidentialite et protection des donnees"
    }
  },
  about: {
    title: "Pourquoi nous construisons ESGCheck",
    description: "Nous pensons que la transparence ESG doit etre rapide, accessible et pratique. ESGCheck donne aux entreprises un point de depart simple pour comprendre et ameliorer leur performance environnementale, sociale et de gouvernance.",
    team: "Nous sommes une petite equipe basee en Suisse et nous utilisons l'IA pour apporter plus de clarte ESG aux entreprises en croissance, consultants et equipes durabilite.",
    clarity: {
      title: "Clarte plutot que complexite",
      description: "Nous transformons des donnees ESG denses en informations simples et exploitables."
    },
    improving: {
      title: "Toujours en progression",
      description: "Utilisez ESGCheck avant, entre ou meme sans audits formels pour garder le cap."
    },
    secure: {
      title: "Securise et fiable",
      description: "Base sur des cadres mondiaux (GRI, CSRD). Vos donnees restent privees."
    }
  },
  waitlist: {
    title: "Pret a faire le premier pas vers de vrais progres ESG?",
    description: "Soyez parmi les premiers a essayer notre verification ESG alimentee par l'IA. Telechargez votre rapport, obtenez des informations exploitables et aidez-nous a construire un produit vraiment utile.",
    cardTitle: "Obtenir un acces anticipe a ESGCheck",
    ctaButton: "Nous ecrire pour un acces anticipe",
    emailNote: "Decrivez votre entreprise et votre principal defi ESG. Nous repondrons avec les details de la beta.",
    modal: {
      disclaimer: "Gratuit pendant la beta - aucune carte bancaire - confidentialite respectee",
      betaNote: "Les premiers testeurs obtiennent un acces gratuit et nous aident a ameliorer ESGCheck."
    }
  },
  footer: {
    description: "ESGCheck aide les entreprises a comprendre leurs rapports ESG avec des informations IA claires, en quelques minutes.",
    product: "Produit",
    company: "Entreprise",
    copyright: "Copyright 2026 ESGCheck. Tous droits reserves."
  }
};
