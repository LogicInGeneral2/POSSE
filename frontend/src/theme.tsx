import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#58041D" },
    secondary: { main: "#F8B628" },
    error: { main: "#d32f2f" },
    warning: { main: "#ed6c02" },
    info: { main: "#0288d1" },
    success: { main: "#2e7d32" },
  },
  typography: {
    fontFamily: ["Roboto", "sans-serif"].join(","),
    allVariants: { color: "#58041D" }, // Applies color to all text elements
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          color: "#58041D", // Change text color
          "& .MuiInputBase-input": {
            color: "#58041D", // Input text color
          },
          "& .MuiInputLabel-root": {
            color: "#58041D", // Label color
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#58041D", // Outline color
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#F8B628", // Border color on hover
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: "#58041D",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#58041D !important", // Ensure it matches TextField
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#F8B628",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#58041D",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: "#58041D", // Applies to all InputBase variants
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#58041D", // Applies to all Radio variants
        },
      },
    },
    MuiRadioGroup: {
      styleOverrides: {
        root: {
          color: "#58041D", // Applies to all RadioGroup variants
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: "#58041D", // Applies to all ToggleButton variants
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          color: "#58041D", // Applies to all ToggleButtonGroup variants
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          color: "#58041D", // Applies to all ToggleButtonGroup variants
        },
      },
    },
    MuiAccordionActions: {
      styleOverrides: {
        root: {
          color: "#58041D", // Applies to all ToggleButtonGroup variants
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          color: "#58041D", // Applies to all ToggleButtonGroup variants
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          color: "#58041D", // Applies to all ToggleButtonGroup variants
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
          backgroundColor: "#58041D !important", // Ensures color remains applied
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
            backgroundColor: "#F8B6281A",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "5px",
          color: "#58041D",
        },
        head: {
          backgroundColor: "#58041D !important",
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
  },
});

export default theme;
