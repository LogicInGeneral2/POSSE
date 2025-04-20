import React, { createContext, useContext, useEffect, useState } from "react";
import { getSystemTheme } from "../src/services";

interface ThemeColor {
  primary: string;
  secondary: string;
  error: string;
  info: string;
  success: string;
  base: string;
  warning: string;
}

interface ThemeContextType {
  theme: ThemeColor | null;
  setTheme: (theme: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeColor | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      const themes = await getSystemTheme();
      if (themes.length > 0) {
        const themeMap: ThemeColor = {
          primary: "#58041D",
          secondary: "#F8B628",
          error: "#d32f2f",
          info: "#0d6efd",
          success: "#28a745",
          base: "#E9DADD",
          warning: "#ed6c02",
        };

        themes.forEach((t: { label: string; main: string }) => {
          if (t.label in themeMap) {
            themeMap[t.label as keyof ThemeColor] = t.main;
          }
        });

        setTheme(themeMap);
      }
    };

    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
