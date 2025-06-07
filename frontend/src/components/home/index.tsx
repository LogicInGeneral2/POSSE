import {
  Stack,
  Typography,
  Divider,
  Grid2 as Grid,
  Paper,
} from "@mui/material";
import { Announcement } from "@mui/icons-material";
import Announcements from "./carousel";
import DashboardCalender from "./calender";
import { useUser } from "../../../context/UserContext";
import { Status } from "./status";
import ErrorNotice from "../commons/error";
import { Info } from "./info";

export const HomePage = () => {
  const { user } = useUser();

  if (!user) {
    return <ErrorNotice />;
  }

  return (
    <>
      <div
        style={{
          height: "100%",
        }}
      >
        <Typography
          fontSize={"3rem"}
          color="primary"
          sx={{ fontWeight: "bold" }}
        >
          Welcome back, {user.name.split(" ").slice(0, 2).join(" ")}
          {"..."}
        </Typography>

        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
        <Grid
          container
          spacing={"40px"}
          sx={{ marginTop: "20px", height: "100%" }}
        >
          <Grid size={4} sx={{ height: "100%" }}>
            <Stack direction="column" sx={{ height: "100%" }}>
              {user.role !== "examiner" && <Info />}
              <Paper
                sx={{
                  mt: user.role === "examiner" ? 0 : "40px",
                  border: "1px solid",
                  backgroundColor: "base.main",
                  borderRadius: "8px",
                  padding: "12px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "25px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  ANNOUNCEMENT <Announcement sx={{ ml: 1 }} />
                </Typography>
                <Divider
                  sx={{ borderBottomWidth: 2, borderColor: "primary.main" }}
                />
                <Announcements />
              </Paper>
            </Stack>
          </Grid>

          <Grid size={8} sx={{ height: "100%" }}>
            <Stack spacing={"40px"} sx={{ width: "100%" }}>
              <Status isStudent={user.role === "student" ? true : false} />
              <DashboardCalender id={user.id} role={user.role} />
            </Stack>
          </Grid>
        </Grid>
      </div>
    </>
  );
};
