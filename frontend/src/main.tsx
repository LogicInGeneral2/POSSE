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
import { ThemeProvider } from "@mui/material";
import { Home } from "./routes/home.tsx";
import { CourseOuline } from "./routes/course_outline.tsx";
import { Supervisors } from "./routes/supervisors.tsx";
import theme from "./theme.tsx";
import { Documents } from "./routes/documents.tsx";
import { Submissions } from "./routes/submissions.tsx";
import { Supervisees } from "./routes/supervisees.tsx";
import { Grading } from "./routes/grading.tsx";
import { Viewing } from "./routes/viewing.tsx";

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
        path: "/supervisors",
        element: <Supervisors />,
      },
      {
        path: "/supervisees",
        element: <Supervisees />,
      },
      {
        path: "/grading",
        element: <Grading />,
      },
      {
        path: "/documents",
        element: <Documents />,
      },
      {
        path: "/submissions",
        element: <Submissions />,
      },
      {
        path: "*",
        element: <ErrorRoute />,
      },
    ],
  },
  {
    path: "/viewing",
    element: <Viewing />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
