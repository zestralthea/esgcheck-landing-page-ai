import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'de' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

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

const getNestedValue = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const getTranslations = (lang: Language) => {
  switch (lang) {
    case 'de':
      return deTranslations;
    case 'fr':
      return frTranslations;
    case 'en':
    default:
      return enTranslations;
  }
};

const enTranslations = {
  header: {
    features: "Features",
    about: "About",
    joinWaitlist: "Join Waitlist"
  },
  hero: {
    title: "Make ESG Progress",
    titleHighlight: "Visible",
    description: "Upload your sustainability report and get instant, AI-powered insights. We help you spot gaps, improve alignment with global frameworks, and stay on track with clarity, not complexity.",
    joinWaitlist: "Join the Waitlist",
    freeBeta: "Free during beta · No credit card needed",
    uploadAnalyze: "Upload. Analyze. Improve.",
    resultsTime: "Results in under 2 minutes",
    frameworks: "Built on trusted frameworks (GRI, CSRD)"
  },
  features: {
    title: "Get ESG clarity — without the complexity",
    subtitle: "ESGCheck gives you instant, actionable insights from your sustainability reports.",
    subtitleTwo: "No consultants, No spreadsheets, No waiting weeks for feedback.",
    score: {
      title: "A simple score that shows where you stand",
      description: "Get an instant ESG performance score that's easy to understand and benchmark against industry standards."
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
      frameworks: "Built on global ESG frameworks like GRI & CSRD",
      frameworksDesc: "Industry-standard compliance foundation",
      audit: "Not a certified audit, but your smartest first step toward one",
      auditDesc: "Prepare confidently for formal assessments",
      security: "Your data is never used to train models and stays secure",
      securityDesc: "Complete privacy and data protection"
    }
  },
  about: {
    title: "Why we're building ESGCheck",
    description: "We believe ESG transparency should be fast, accessible, and practical, not just reserved for large corporations with audit budgets. ESGCheck gives companies an easy starting point to track their environmental, social, and governance performance in real time, and improve over time.",
    team: "We're a small, Swiss-based team using AI to bring ESG clarity to those who need it most: growing businesses, consultants, and early-stage sustainability teams.",
    clarity: {
      title: "Clarity over Complexity",
      description: "We turn dense ESG data into simple, actionable insights."
    },
    improving: {
      title: "Always Improving",
      description: "Use ESGCheck before, between, or even without formal audits to keep progress on track."
    },
    secure: {
      title: "Secure & Trustworthy",
      description: "Built on global frameworks (GRI, CSRD). Your data is always private."
    }
  },
  waitlist: {
    title: "Ready to Take the First Step Toward Real ESG Progress?",
    description: "Be one of the first to try our AI-powered ESG health check. Upload your report, get actionable insights, and help us build something truly useful.",
    cardTitle: "Join the ESGCheck Beta",
    modal: {
      title: "Join the ESGCheck Beta",
      description: "Be one of the first to try our AI-powered ESG health check. Upload your report, get actionable insights, and help us build something truly useful.",
      namePlaceholder: "Full Name",
      companyPlaceholder: "Company",
      emailPlaceholder: "Work Email",
      submitButton: "Join Waitlist",
      submittingButton: "Joining...",
      disclaimer: "Free during beta · No credit card · Privacy respected",
      betaNote: "Early testers get free access and help us build ESGCheck into the tool you need.",
      successTitle: "Thank you!",
      successMessage: "You've been added to our waitlist. We'll be in touch soon with early access details."
    }
  },
  footer: {
    description: "ESGCheck helps businesses make sense of their ESG reports with AI-powered insights and guidance, in minutes.",
    product: "Product",
    company: "Company",
    legal: "Legal",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    copyright: "© 2025 ESGCheck. All rights reserved."
  }
};

const deTranslations = {
  header: {
    features: "Funktionen",
    about: "Über uns",
    joinWaitlist: "Warteliste beitreten"
  },
  hero: {
    title: "ESG-Fortschritt",
    titleHighlight: "Sichtbar machen",
    description: "Laden Sie Ihren Nachhaltigkeitsbericht hoch und erhalten Sie sofortige, KI-gestützte Einblicke. Wir helfen Ihnen, Lücken zu erkennen, die Angleichung an globale Frameworks zu verbessern und mit Klarheit, nicht Komplexität, auf Kurs zu bleiben.",
    joinWaitlist: "Warteliste beitreten",
    freeBeta: "Kostenlos während Beta · Keine Kreditkarte erforderlich",
    uploadAnalyze: "Hochladen. Analysieren. Verbessern.",
    resultsTime: "Ergebnisse in unter 2 Minuten",
    frameworks: "Basiert auf vertrauenswürdigen Frameworks (GRI, CSRD)"
  },
  features: {
    title: "ESG-Klarheit erhalten — ohne die Komplexität",
    subtitle: "ESGCheck gibt Ihnen sofortige, umsetzbare Einblicke aus Ihren Nachhaltigkeitsberichten.",
    subtitleTwo: "Keine Berater, keine Tabellen, kein wochenlanges Warten auf Feedback.",
    score: {
      title: "Eine einfache Bewertung, die zeigt, wo Sie stehen",
      description: "Erhalten Sie sofort eine ESG-Leistungsbewertung, die leicht zu verstehen ist und mit Branchenstandards verglichen werden kann."
    },
    risks: {
      title: "Risiken erkennen, bevor Investoren oder Regulatoren es tun",
      description: "Identifizieren Sie Compliance-Lücken und potenzielle Probleme, bevor sie zu kostspieligen Problemen oder regulatorischen Verstößen werden."
    },
    suggestions: {
      title: "KI-generierte Vorschläge, maßgeschneidert für Ihren Bericht",
      description: "Erhalten Sie spezifische, umsetzbare Empfehlungen basierend auf Ihren tatsächlichen Daten und branchenweiten Best Practices."
    },
    summary: {
      title: "Eine übersichtliche Zusammenfassung als PDF, die Sie mit Ihrem Team teilen können",
      description: "Exportieren Sie professionelle Berichte, die Ihren ESG-Fortschritt klar an Stakeholder und Führungskräfte kommunizieren."
    },
    upload: {
      title: "Einmal hochladen, Einblicke in Minuten erhalten",
      description: "Verwandeln Sie wochenlange Analysen in Minuten. Laden Sie einfach Ihren Bericht hoch und erhalten Sie sofort umfassende Einblicke."
    },
    trust: {
      frameworks: "Basiert auf globalen ESG-Frameworks wie GRI & CSRD",
      frameworksDesc: "Branchenstandard-Compliance-Grundlage",
      audit: "Kein zertifiziertes Audit, aber Ihr klügster erster Schritt dorthin",
      auditDesc: "Bereiten Sie sich selbstbewusst auf formale Bewertungen vor",
      security: "Ihre Daten werden niemals zum Trainieren von Modellen verwendet und bleiben sicher",
      securityDesc: "Vollständige Privatsphäre und Datenschutz"
    }
  },
  about: {
    title: "Warum wir ESGCheck entwickeln",
    description: "Wir glauben, dass ESG-Transparenz schnell, zugänglich und praktisch sein sollte, nicht nur großen Unternehmen mit Audit-Budgets vorbehalten. ESGCheck gibt Unternehmen einen einfachen Ausgangspunkt, um ihre Umwelt-, Sozial- und Governance-Leistung in Echtzeit zu verfolgen und sich im Laufe der Zeit zu verbessern.",
    team: "Wir sind ein kleines, in der Schweiz ansässiges Team, das KI nutzt, um ESG-Klarheit zu denjenigen zu bringen, die sie am meisten brauchen: wachsende Unternehmen, Berater und frühe Nachhaltigkeitsteams.",
    clarity: {
      title: "Klarheit über Komplexität",
      description: "Wir verwandeln dichte ESG-Daten in einfache, umsetzbare Einblicke."
    },
    improving: {
      title: "Immer verbessernd",
      description: "Verwenden Sie ESGCheck vor, zwischen oder sogar ohne formale Audits, um den Fortschritt auf Kurs zu halten."
    },
    secure: {
      title: "Sicher & Vertrauenswürdig",
      description: "Basiert auf globalen Frameworks (GRI, CSRD). Ihre Daten sind immer privat."
    }
  },
  waitlist: {
    title: "Bereit, den ersten Schritt zu echtem ESG-Fortschritt zu machen?",
    description: "Seien Sie einer der ersten, die unseren KI-gestützten ESG-Gesundheitscheck ausprobieren. Laden Sie Ihren Bericht hoch, erhalten Sie umsetzbare Einblicke und helfen Sie uns, etwas wirklich Nützliches zu bauen.",
    cardTitle: "ESGCheck Beta beitreten",
    modal: {
      title: "ESGCheck Beta beitreten",
      description: "Seien Sie einer der ersten, die unseren KI-gestützten ESG-Gesundheitscheck ausprobieren. Laden Sie Ihren Bericht hoch, erhalten Sie umsetzbare Einblicke und helfen Sie uns, etwas wirklich Nützliches zu bauen.",
      namePlaceholder: "Vollständiger Name",
      companyPlaceholder: "Unternehmen",
      emailPlaceholder: "Geschäftliche E-Mail",
      submitButton: "Warteliste beitreten",
      submittingButton: "Beitreten...",
      disclaimer: "Kostenlos während Beta · Keine Kreditkarte · Privatsphäre respektiert",
      betaNote: "Frühe Tester erhalten kostenlosen Zugang und helfen uns, ESGCheck zu dem Tool zu entwickeln, das Sie brauchen.",
      successTitle: "Vielen Dank!",
      successMessage: "Sie wurden zu unserer Warteliste hinzugefügt. Wir werden uns bald mit Details zum frühen Zugang bei Ihnen melden."
    }
  },
  footer: {
    description: "ESGCheck hilft Unternehmen, ihre ESG-Berichte mit KI-gestützten Einblicken und Anleitung in Minuten zu verstehen.",
    product: "Produkt",
    company: "Unternehmen",
    legal: "Rechtliches",
    privacy: "Datenschutzrichtlinie",
    terms: "Nutzungsbedingungen",
    copyright: "© 2025 ESGCheck. Alle Rechte vorbehalten."
  }
};

const frTranslations = {
  header: {
    features: "Fonctionnalités",
    about: "À propos",
    joinWaitlist: "Rejoindre la liste d'attente"
  },
  hero: {
    title: "Rendre les progrès ESG",
    titleHighlight: "Visibles",
    description: "Téléchargez votre rapport de durabilité et obtenez des informations instantanées alimentées par l'IA. Nous vous aidons à identifier les lacunes, améliorer l'alignement avec les cadres mondiaux et rester sur la bonne voie avec clarté, pas complexité.",
    joinWaitlist: "Rejoindre la liste d'attente",
    freeBeta: "Gratuit pendant la bêta · Aucune carte de crédit requise",
    uploadAnalyze: "Télécharger. Analyser. Améliorer.",
    resultsTime: "Résultats en moins de 2 minutes",
    frameworks: "Basé sur des cadres de confiance (GRI, CSRD)"
  },
  features: {
    title: "Obtenez la clarté ESG — sans la complexité",
    subtitle: "ESGCheck vous donne des informations instantanées et exploitables à partir de vos rapports de durabilité.",
    subtitleTwo: "Pas de consultants, pas de feuilles de calcul, pas d'attente de semaines pour les commentaires.",
    score: {
      title: "Un score simple qui montre où vous en êtes",
      description: "Obtenez instantanément un score de performance ESG facile à comprendre et à comparer aux normes de l'industrie."
    },
    risks: {
      title: "Repérez les risques avant que les investisseurs ou les régulateurs ne le fassent",
      description: "Identifiez les lacunes de conformité et les problèmes potentiels avant qu'ils ne deviennent des problèmes coûteux ou des violations réglementaires."
    },
    suggestions: {
      title: "Suggestions générées par l'IA adaptées à votre rapport",
      description: "Recevez des recommandations spécifiques et exploitables basées sur vos données réelles et les meilleures pratiques de l'industrie."
    },
    summary: {
      title: "Un résumé PDF propre que vous pouvez partager avec votre équipe",
      description: "Exportez des rapports professionnels qui communiquent clairement vos progrès ESG aux parties prenantes et à la direction."
    },
    upload: {
      title: "Téléchargez une fois, obtenez des informations en minutes",
      description: "Transformez des semaines d'analyse en minutes. Téléchargez simplement votre rapport et obtenez instantanément des informations complètes."
    },
    trust: {
      frameworks: "Basé sur les cadres ESG mondiaux comme GRI & CSRD",
      frameworksDesc: "Fondation de conformité aux normes de l'industrie",
      audit: "Pas un audit certifié, mais votre première étape la plus intelligente vers un",
      auditDesc: "Préparez-vous en toute confiance pour les évaluations formelles",
      security: "Vos données ne sont jamais utilisées pour entraîner des modèles et restent sécurisées",
      securityDesc: "Confidentialité complète et protection des données"
    }
  },
  about: {
    title: "Pourquoi nous construisons ESGCheck",
    description: "Nous croyons que la transparence ESG devrait être rapide, accessible et pratique, pas seulement réservée aux grandes entreprises avec des budgets d'audit. ESGCheck donne aux entreprises un point de départ facile pour suivre leur performance environnementale, sociale et de gouvernance en temps réel, et s'améliorer au fil du temps.",
    team: "Nous sommes une petite équipe basée en Suisse utilisant l'IA pour apporter la clarté ESG à ceux qui en ont le plus besoin : les entreprises en croissance, les consultants et les équipes de durabilité en phase précoce.",
    clarity: {
      title: "Clarté plutôt que complexité",
      description: "Nous transformons les données ESG denses en informations simples et exploitables."
    },
    improving: {
      title: "Toujours en amélioration",
      description: "Utilisez ESGCheck avant, entre ou même sans audits formels pour maintenir les progrès sur la bonne voie."
    },
    secure: {
      title: "Sécurisé et digne de confiance",
      description: "Basé sur des cadres mondiaux (GRI, CSRD). Vos données sont toujours privées."
    }
  },
  waitlist: {
    title: "Prêt à faire le premier pas vers de vrais progrès ESG?",
    description: "Soyez parmi les premiers à essayer notre vérification de santé ESG alimentée par l'IA. Téléchargez votre rapport, obtenez des informations exploitables et aidez-nous à construire quelque chose de vraiment utile.",
    cardTitle: "Rejoindre la bêta ESGCheck",
    modal: {
      title: "Rejoindre la bêta ESGCheck",
      description: "Soyez parmi les premiers à essayer notre vérification de santé ESG alimentée par l'IA. Téléchargez votre rapport, obtenez des informations exploitables et aidez-nous à construire quelque chose de vraiment utile.",
      namePlaceholder: "Nom complet",
      companyPlaceholder: "Entreprise",
      emailPlaceholder: "Email professionnel",
      submitButton: "Rejoindre la liste d'attente",
      submittingButton: "Inscription...",
      disclaimer: "Gratuit pendant la bêta · Aucune carte de crédit · Confidentialité respectée",
      betaNote: "Les premiers testeurs obtiennent un accès gratuit et nous aident à construire ESGCheck selon vos besoins.",
      successTitle: "Merci!",
      successMessage: "Vous avez été ajouté à notre liste d'attente. Nous vous contacterons bientôt avec les détails d'accès anticipé."
    }
  },
  footer: {
    description: "ESGCheck aide les entreprises à comprendre leurs rapports ESG avec des informations et des conseils alimentés par l'IA, en minutes.",
    product: "Produit",
    company: "Entreprise",
    legal: "Légal",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    copyright: "© 2025 ESGCheck. Tous droits réservés."
  }
};
