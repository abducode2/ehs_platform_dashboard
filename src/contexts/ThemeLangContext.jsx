import React, { createContext, useState, useEffect, useContext } from "react";

const ThemeLangContext = createContext();

export const useThemeLang = () => useContext(ThemeLangContext);

export const ThemeLangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem("ehs_lang") || "ar");
  const [theme, setTheme] = useState(
    localStorage.getItem("ehs_theme") || "light",
  );

  useEffect(() => {
    localStorage.setItem("ehs_lang", lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("ehs_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const toggleLang = () => setLang((prev) => (prev === "ar" ? "en" : "ar"));

  return (
    <ThemeLangContext.Provider value={{ lang, theme, toggleTheme, toggleLang }}>
      {children}
    </ThemeLangContext.Provider>
  );
};
