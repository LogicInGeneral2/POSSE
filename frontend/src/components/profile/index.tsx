import { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Avatar,
  CircularProgress,
  Divider,
  Paper,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TopicIcon from "@mui/icons-material/Topic";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { changePassword, getCurrentUser } from "../../services";
import { Student, Supervisor, User } from "../../services/types";
import { Grid2 as Grid } from "@mui/material";
import { GradingRounded, SupervisorAccountRounded } from "@mui/icons-material";

type UserProfile = User | Student | Supervisor;

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
    <Box>
      <Typography fontSize={"3rem"} color="primary" sx={{ fontWeight: "bold" }}>
        My Profile
      </Typography>

      <Divider
        sx={{ borderBottomWidth: 2, borderColor: "primary.main", mb: 2 }}
      />

      <Grid container spacing={4}>
        <Grid size={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 2,
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
              <Typography variant="h5" sx={{ fontWeight: "medium" }}>
                {user?.name}
              </Typography>
            </Box>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={user?.email} />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <BadgeIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Role" secondary={user?.role} />
              </ListItem>

              {user?.role === "supervisor" && "supervisor_id" in user && (
                <>
                  <ListItem>
                    <ListItemIcon>
                      <SupervisorAccountRounded color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="FYP 1 Supervisees"
                      secondary={user.supervisees_FYP1 + " Students" || "None"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SupervisorAccountRounded color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="FYP 2 Supervisees"
                      secondary={user.supervisees_FYP2 + " Students" || "None"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <GradingRounded color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="FYP 1 Evaluees"
                      secondary={user.evaluatees_FYP1 + " Students" || "None"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <GradingRounded color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="FYP 2 Evaluees"
                      secondary={user.evaluatees_FYP2 + " Students" || "None"}
                    />
                  </ListItem>
                </>
              )}

              {user?.role === "student" && "student_id" in user && (
                <>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Student ID"
                      secondary={user.student_id}
                    />
                  </ListItem>

                  <Divider sx={{ my: 1 }} />

                  <ListItem>
                    <ListItemIcon>
                      <MenuBookIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Course" secondary={user.course} />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <BadgeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Mode"
                      secondary={user.mode || "Not assigned "}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <TopicIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Topic"
                      secondary={user.topic || "Not assigned / Unknown"}
                    />
                  </ListItem>

                  <Divider sx={{ my: 1 }} />

                  <ListItem>
                    <ListItemIcon>
                      <SupervisorAccountIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Supervisor"
                      secondary={user.supervisor || "Not assigned"}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <AlternateEmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Supervisor Email"
                      secondary={user.supervisor_email || "Not assigned"}
                    />
                  </ListItem>

                  <Divider sx={{ my: 1 }} />

                  <ListItem>
                    <ListItemIcon>
                      <AssessmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Evaluators"
                      secondary={
                        user.evaluators?.length
                          ? user.evaluators.join(", ")
                          : "Not assigned"
                      }
                    />
                  </ListItem>
                </>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid size={6}>
          <Paper
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
