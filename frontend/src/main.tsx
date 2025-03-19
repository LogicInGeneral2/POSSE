import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RootRoute } from "./routes/root.tsx";
import { ErrorRoute } from "./routes/error.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";

import "./index.css";
import App from "./App.tsx";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createTheme, ThemeProvider } from "@mui/material";
import { Home } from "./routes/home.tsx";
import { CourseOuline } from "./routes/course_outline.tsx";

const theme = createTheme({
  palette: {
    primary: {
      main: "#58041D",
    },
    secondary: {
      main: "#F8B628",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#ed6c02",
    },
    info: {
      main: "#0288d1",
    },
    success: {
      main: "#2e7d32",
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/",
    element: <RootRoute />,
    errorElement: <ErrorRoute />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      { path: "/course_outline", element: <CourseOuline /> },
      {
        path: "*",
        element: <ErrorRoute />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
