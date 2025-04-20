import { createTheme } from "@mui/material/styles";
import { useTheme } from "../context/ThemeContext";
import { useMemo } from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";

declare module "@mui/material/styles" {
  interface Palette {
    base: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
  interface PaletteOptions {
    base?: {
      main: string;
    };
  }
}

export const useDynamicTheme = () => {
  const { theme } = useTheme();

  // Use fetched colors or fallbacks
  const primaryColor = theme?.primary || "#58041D";
  const secondaryColor = theme?.secondary || "#F8B628";
  const errorColor = theme?.error || "#d32f2f";
  const infoColor = theme?.info || "#0d6efd";
  const successColor = theme?.success || "#28a745";
  const baseColor = theme?.base || "#E9DADD";
  const warningColor = theme?.warning || "#ed6c02";

  // Memoize the theme to prevent unnecessary re-creation
  return useMemo(
    () =>
      createTheme({
        palette: {
          primary: { main: primaryColor },
          secondary: { main: secondaryColor },
          error: { main: errorColor },
          warning: { main: warningColor },
          info: { main: infoColor },
          success: { main: successColor },
          base: { main: baseColor },
        },
        typography: {
          fontFamily: ["Roboto", "sans-serif"].join(","),
          allVariants: { color: primaryColor },
        },
        components: {
          MuiTextField: {
            styleOverrides: {
              root: {
                color: primaryColor,
                "& .MuiInputBase-input": {
                  color: primaryColor,
                },
                "& .MuiInputLabel-root": {
                  color: primaryColor,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: primaryColor,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: secondaryColor,
                },
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              root: {
                color: primaryColor,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: `${primaryColor} !important`,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: secondaryColor,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: primaryColor,
                },
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              root: {
                color: primaryColor,
              },
            },
          },
          MuiRadio: {
            styleOverrides: {
              root: {
                color: primaryColor,
              },
            },
          },
          MuiRadioGroup: {
            styleOverrides: {
              root: {
                color: primaryColor,
              },
            },
          },
          MuiToggleButton: {
            styleOverrides: {
              root: {
                color: primaryColor,
              },
            },
          },
          MuiToggleButtonGroup: {
            styleOverrides: {
              root: {
                color: primaryColor,
              },
            },
          },
          MuiAccordion: {
            styleOverrides: {
              root: {
                color: primaryColor,
              },
            },
          },
          MuiAccordionActions: {
            styleOverrides: {
              root: {
                color: primaryColor,
              },
            },
          },
          MuiAccordionDetails: {
            styleOverrides: {
              root: {
                color: primaryColor,
              },
            },
          },
          MuiAccordionSummary: {
            styleOverrides: {
              root: {
                color: primaryColor,
              },
            },
          },
          MuiTableContainer: {
            styleOverrides: {
              root: {
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                backgroundColor: `${primaryColor} !important`,
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                "&:nth-of-type(odd)": {
                  backgroundColor: "#F8F8F8",
                },
                "&:hover": {
                  backgroundColor: `${secondaryColor}1A`,
                },
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                padding: "5px",
                color: primaryColor,
              },
              head: {
                backgroundColor: `${primaryColor} !important`,
                color: "#FFFFFF",
                fontWeight: "bold",
                fontSize: "1rem",
              },
              body: {
                fontSize: "1rem",
              },
            },
          },
          MuiTableBody: {
            styleOverrides: {
              root: {
                backgroundColor: "#FFFFFF",
              },
            },
          },
          MuiPickersDay: {
            styleOverrides: {
              root: {
                color: primaryColor,
                "&.Mui-selected": {
                  backgroundColor: primaryColor,
                  color: "#FFFFFF",
                },
                "&:hover": {
                  backgroundColor: secondaryColor,
                  color: primaryColor,
                },
              },
            },
          },
          MuiDayCalendar: {
            styleOverrides: {
              weekDayLabel: {
                color: primaryColor,
                fontWeight: "bold",
              },
            },
          },
          MuiDateCalendar: {
            styleOverrides: {
              root: {
                backgroundColor: "#fff",
                color: primaryColor,
                borderRadius: "8px",
              },
            },
          },
        },
      }),
    [
      primaryColor,
      secondaryColor,
      errorColor,
      infoColor,
      successColor,
      baseColor,
      warningColor,
    ]
  );
};
