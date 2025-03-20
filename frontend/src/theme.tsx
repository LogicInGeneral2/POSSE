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
          color: "#58041D", // Selected text color
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#58041D", // Default border color
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#F8B628", // Border color on hover
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
  },
});

export default theme;
