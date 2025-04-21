import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export const DynamicStyles: React.FC = () => {
  const { theme } = useTheme();

  const clamp = (val: number) => Math.max(0, Math.min(255, val));

  const hexToRgb = (hex: string): [number, number, number] => {
    const sanitizedHex = hex.replace("#", "");
    const bigint = parseInt(sanitizedHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  };

  const darkenColor = (hex: string, amount: number = 0.2): string => {
    const [r, g, b] = hexToRgb(hex);
    return `rgb(${clamp(r - 255 * amount)}, ${clamp(g - 255 * amount)}, ${clamp(
      b - 255 * amount
    )})`;
  };

  const lightenColor = (hex: string, amount: number = 0.2): string => {
    const [r, g, b] = hexToRgb(hex);
    return `rgb(${clamp(r + 255 * amount)}, ${clamp(g + 255 * amount)}, ${clamp(
      b + 255 * amount
    )})`;
  };

  useEffect(() => {
    const primaryColor = theme?.primary || "#58041D";
    const secondaryColor = theme?.secondary || "#F8B628";
    const errorColor = theme?.error || "#d32f2f";
    const infoColor = theme?.info || "#0d6efd";
    const successColor = theme?.success || "#28a745";
    const baseColor = theme?.base || "#E9DADD";
    const warningColor = theme?.warning || "#ed6c02";
    const lighterPrimaryColor = lightenColor(primaryColor, 0.5);
    const lightestPrimaryColor = lightenColor(primaryColor, 0.6);

    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      :root {
        --primary-color: ${primaryColor};
        --secondary-color: ${secondaryColor};
        --thirtiary-color: ${baseColor};
        --error-color: ${errorColor};
        --info-color: ${infoColor};
        --success-color: ${successColor};
        --base-color: ${baseColor};
        --lighter-primary-color: ${lighterPrimaryColor};
        --lightest-primary-color: ${lightestPrimaryColor};
        --warning-color: ${warningColor};
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
        font-weight: 400;
        color: var(--primary-color);
        background-color: #ffffff;
        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      body {
        margin: 0;
        padding: 0;
      }

      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: var(--thirtiary-color); /* Soft background */
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: var(--primary-color); /* Dark thumb */
        border-radius: 10px;
        transition: background 0.3s ease;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: var(--secondary-color); /* Highlight on hover */
      }

      .css-1lwhjos-MuiPaper-root-MuiDrawer-paper {
        background-color: var(--thirtiary-color) !important;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [theme]);

  return null;
};
