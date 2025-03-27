import Box from "@mui/material/Box";
import {
  Stack,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  LockRounded,
  AccountCircle,
  VisibilityOff,
  Visibility,
} from "@mui/icons-material";
import React from "react";
import logo from "../../assets/icon.png";
import "./login.css";
import { useNavigate } from "react-router";
import { useUser } from "../../../context/UserContext";
import { Student, Supervisor } from "../../services/types";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
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

  const handleLogin = () => {
    const userData: Supervisor = {
      id: 2,
      name: "Dr. Jane Smith",
      email: "jane@example.com",
      role: "supervisor",
      supervisor_id: 2,
      supervisees_FYP1: ["Ali", "Abu", "Fatimah"],
      supervisees_FYP2: ["Ching", "Chong"],
    };

    {
      /*
      id: 1,
      name: "John Doe Bin Eod Nhoj",
      email: "john@example.com",
      role: "student",
      student_id: 1,
      supervisor: "Memoon Bin Mehdi",
      evaluators: ["Ali", "Abu", "Fatimah"],
      course: "FYP 1",
      */
    }

    login(userData);
    navigate("/home");
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
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <form className="login-form" action="">
            <Typography
              color="primary"
              sx={{
                mb: 2,
                fontSize: 42,
                textAlign: "center",
              }}
            >
              Login
            </Typography>

            <div className="input-box">
              <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                <AccountCircle color="primary" sx={{ mr: 1, my: 0.5 }} />
                <TextField
                  label="Username"
                  variant="standard"
                  sx={{ width: "100%" }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                <LockRounded color="primary" sx={{ mr: 1, my: 0.5 }} />
                <TextField
                  label="Password"
                  variant="standard"
                  sx={{ width: "100%" }}
                  type={showPassword ? "text" : "password"}
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
                          {showPassword ? (
                            <VisibilityOff className="eye-icon" />
                          ) : (
                            <Visibility className="eye-icon" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Stack
                direction="row"
                spacing={2}
                sx={{ justifyContent: "space-between", fontSize: 4 }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Remember Me"
                    sx={{
                      "& .MuiSvgIcon-root": { fontSize: "01rem" },
                      "& .MuiTypography-root": { fontSize: "0.75rem" },
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    component="a"
                    href=""
                    color="primary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    Forgot Password?
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                color="primary"
                onClick={handleLogin}
                sx={{ borderRadius: "16px" }}
              >
                Login
              </Button>
            </div>
          </form>
        </Box>
      </Stack>
    </>
  );
};
