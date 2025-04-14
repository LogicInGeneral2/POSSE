import Box from "@mui/material/Box";
import {
  Stack,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { LockRounded, VisibilityOff, Visibility } from "@mui/icons-material";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import logo from "../src/assets/icon.png";
import { resetPasswordConfirm } from "../src/services";

export const ResetPasswordConfirmPage = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleReset = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setLoading(true);

    // Validate passwords
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      alert(passwordError);
      setLoading(false);
      return;
    }

    try {
      if (uid && token) {
        await resetPasswordConfirm(uid, token, password);
        alert("Password reset successful");
        navigate("/");
      } else {
        alert("Invalid URL parameters");
      }
    } catch (error: any) {
      console.error("Password reset failed:", error);
      const errorMessage = error.response?.data?.error || "Unknown error";
      if (errorMessage === "Invalid or expired token") {
        alert("The password reset link is invalid or has expired.");
      } else if (errorMessage === "Invalid request body") {
        alert("Invalid request. Please try again.");
      } else if (errorMessage === "Missing required fields") {
        alert("Required information is missing.");
      } else {
        alert(`Password reset failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack
        direction="row"
        sx={{
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            border: "1px solid #58041D",
            borderRight: 0,
            p: 2,
            minHeight: 400,
            minWidth: 150,
            display: "block",
            alignContent: "center",
            justifyContent: "center",
            borderRadius: "16px",
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            backgroundColor: "#E9DADD",
          }}
        >
          <img
            src={logo}
            alt="POSSE Logo"
            style={{ height: 200, width: 200 }}
          />
          <Typography
            color="primary"
            sx={{ fontSize: 42, textAlign: "center" }}
          >
            POSSE
          </Typography>
        </Box>
        <Box
          sx={{
            border: "1px solid #58041D",
            borderRadius: "16px",
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            p: 2,
            minHeight: 400,
            minWidth: 450,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            color="primary"
            sx={{
              fontSize: 42,
              textAlign: "center",
            }}
          >
            Set New Password
          </Typography>

          <Box sx={{ width: "100%", padding: "0 20px" }}>
            <Box sx={{ display: "flex", alignItems: "flex-end" }}>
              <LockRounded color="primary" sx={{ mr: 1, my: 0.5 }} />
              <TextField
                label="New Password"
                variant="standard"
                sx={{ width: "100%" }}
                type={showPassword ? "text" : "password"}
                onChange={(event) => setPassword(event.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword
                            ? "hide the password"
                            : "display the password"
                        }
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        onMouseUp={handleMouseUpPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-end" }}>
              <LockRounded color="primary" sx={{ mr: 1, my: 0.5 }} />
              <TextField
                label="Confirm Password"
                variant="standard"
                sx={{ width: "100%" }}
                type={showConfirmPassword ? "text" : "password"}
                onChange={(event) => setConfirmPassword(event.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showConfirmPassword
                            ? "hide the password"
                            : "display the password"
                        }
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        onMouseUp={handleMouseUpPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate("/")}
                  sx={{ borderRadius: "16px" }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleReset}
                  sx={{ borderRadius: "16px" }}
                >
                  Confirm
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Stack>
    </>
  );
};
