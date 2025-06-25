import React, { createContext, useContext, useState } from "react";

type Language = "pt" | "en";

const translations = {
  pt: {
    placeholder: "Digite sua pergunta...",
    send: "Enviar",
  },
  en: {
    placeholder: "Type your question...",
    send: "Send",
  },
};

const LanguageContext = createContext({
  language: "pt" as Language,
  toggleLanguage: () => {},
  t: (key: keyof typeof translations["pt"]) => translations.pt[key],
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("pt");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "pt" ? "en" : "pt"));
  };

  const t = (key: keyof typeof translations["pt"]) => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
