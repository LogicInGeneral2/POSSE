import Box from "@mui/material/Box";
import {
  Stack,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import logo from "../../assets/icon.png";
import { useState } from "react";
import { useNavigate } from "react-router";
import { resetPasswordRequest } from "../../services";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const handleRequest = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    try {
      await resetPasswordRequest(email);
      setSuccess("Password reset email sent successfully");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      setError(error.message || "Failed to send password reset email");
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
            Password Reset
          </Typography>

          <Box sx={{ width: "100%", padding: "0 20px" }}>
            {" "}
            {success && (
              <Alert severity="success" sx={{ my: 2 }}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ my: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
              <AccountCircle color="primary" sx={{ mr: 1, my: 0.5 }} />
              <TextField
                label="Email"
                variant="standard"
                sx={{ width: "100%" }}
                onChange={(event) => setEmail(event.target.value)}
                error={!!error}
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
                  onClick={handleRequest}
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
