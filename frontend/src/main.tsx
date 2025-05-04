import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RootRoute } from "./routes/root.tsx";
import { ErrorRoute } from "./routes/error.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Home } from "./routes/home.tsx";
import { CourseOuline } from "./routes/course_outline.tsx";
import { Supervisors } from "./routes/supervisors.tsx";
import { Documents } from "./routes/documents.tsx";
import { Submissions } from "./routes/submissions.tsx";
import { Supervisees } from "./routes/supervisees.tsx";
import { Grading } from "./routes/grading.tsx";
import { Viewing } from "./routes/viewing.tsx";
import { UserProvider } from "../context/UserContext";
import { Logs } from "./routes/logs.tsx";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import { Logout } from "./routes/logout.tsx";
import { ResetPassword } from "./routes/request_reset.tsx";
import { ConfirmPassword } from "./routes/confirm_reset.tsx";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { useDynamicTheme } from "./theme.tsx";
import { ThemeProvider as CustomThemeProvider } from "../context/ThemeContext.tsx";
import App from "./App.tsx";
import { Profile } from "./routes/profile.tsx";
import { Grades } from "./routes/grades.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/reset-password/confirm/:uid/:token",
    element: <ConfirmPassword />,
  },
  {
    path: "/",
    element: <RootRoute />,
    errorElement: <ErrorRoute />,
    children: [
      {
        path: "/home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/course_outline",
        element: (
          <ProtectedRoute>
            <CourseOuline />
          </ProtectedRoute>
        ),
      },
      {
        path: "/supervisors",
        element: (
          <ProtectedRoute>
            <Supervisors />
          </ProtectedRoute>
        ),
      },
      {
        path: "/supervisees",
        element: (
          <ProtectedRoute>
            <Supervisees />
          </ProtectedRoute>
        ),
      },
      {
        path: "/grading",
        element: (
          <ProtectedRoute>
            <Grading />
          </ProtectedRoute>
        ),
      },
      {
        path: "/documents",
        element: (
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        ),
      },
      {
        path: "/submissions",
        element: (
          <ProtectedRoute>
            <Submissions />
          </ProtectedRoute>
        ),
      },
      {
        path: "/logs",
        element: (
          <ProtectedRoute>
            <Logs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/grades",
        element: (
          <ProtectedRoute>
            <Grades />
          </ProtectedRoute>
        ),
      },
      {
        path: "/logout",
        element: <Logout />,
      },
    ],
  },
  {
    path: "/viewing",
    element: (
      <ProtectedRoute>
        <Viewing />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <ErrorRoute />,
  },
]);

function AppWrapper() {
  const theme = useDynamicTheme();
  return (
    <MuiThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </MuiThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <CustomThemeProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AppWrapper />
        </LocalizationProvider>
      </CustomThemeProvider>
    </UserProvider>
  </StrictMode>
);
