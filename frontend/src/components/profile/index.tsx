import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Avatar,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import { changePassword, getCurrentUser } from "../../services";
import { Student, User } from "../../services/types";
import { Grid2 as Grid } from "@mui/material";

type UserProfile = User | Student;

const ProfilePage = () => {
  const theme = useTheme();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setSuccess("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to change password.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography
        fontSize={"3rem"}
        color="secondary"
        sx={{ fontWeight: "bold" }}
      >
        My Profile
      </Typography>

      <Divider
        sx={{ borderBottomWidth: 2, borderColor: "primary.main", mb: 2 }}
      />

      <Grid container spacing={4}>
        <Grid size={6}>
          <Box
            sx={{
              p: 3,
              borderRadius: "8px",
              border: "1px solid",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "primary.main",
                  mr: 2,
                }}
              >
                <PersonIcon fontSize="large" />
              </Avatar>
              <Typography
                variant="h5"
                sx={{ fontWeight: "medium", color: theme.palette.text.primary }}
              >
                {user?.name}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "medium",
                  color: theme.palette.text.secondary,
                }}
              >
                Email
              </Typography>
              <Typography>{user?.email}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "medium",
                  color: theme.palette.text.secondary,
                }}
              >
                Role
              </Typography>
              <Typography>{user?.role}</Typography>
            </Box>
            {user?.role === "student" && "student_id" in user && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "medium",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Student ID
                  </Typography>
                  <Typography>{user.student_id}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "medium",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Course
                  </Typography>
                  <Typography>{user.course}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "medium",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Supervisor
                  </Typography>
                  <Typography>{user.supervisor || "Not assigned"}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "medium",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Evaluators
                  </Typography>
                  <Typography>
                    {user.evaluators?.join(", ") || "Not assigned"}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Grid>

        <Grid size={6}>
          <Box
            sx={{
              p: 3,
              borderRadius: "8px",
              border: "1px solid",
              backgroundColor: "base.main",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: "medium",
                color: theme.palette.text.primary,
              }}
            >
              Change Password
            </Typography>
            <form onSubmit={handlePasswordChange}>
              <TextField
                fullWidth
                label="Old Password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2, py: 1.5 }}
              >
                Change Password
              </Button>
            </form>
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
