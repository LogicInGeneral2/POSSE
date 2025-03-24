import "./style.css";
import { Stack, Typography, Divider, Grid2 as Grid } from "@mui/material";
import {
  SupervisorAccountRounded,
  WatchLaterRounded,
  Announcement,
} from "@mui/icons-material";
import Announcements from "./carousel";
import DashboardCalender from "./calender";
import { useUser } from "../../../context/UserContext";
import { Status } from "./status";

export const HomePage = () => {
  const { user } = useUser();

  return (
    <>
      <div
        style={{
          height: "100%",
        }}
      >
        <Typography
          fontSize={"3rem"}
          color="secondary"
          sx={{ fontWeight: "bold" }}
        >
          Welcome back, {user?.name.split(" ").slice(0, 2).join(" ")}
        </Typography>

        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
        <Grid container spacing={2} sx={{ marginTop: "20px", height: "100%" }}>
          <Grid size={4} sx={{ height: "100%" }}>
            <Stack direction="column" sx={{ height: "100%" }}>
              <Grid
                container
                spacing={2}
                sx={{
                  border: "1px solid #58041D",
                  borderRadius: "8px",
                  alignContent: "center",
                }}
              >
                <Grid
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                >
                  <SupervisorAccountRounded sx={{ mr: 1 }} /> Supervisor:
                  {user?.supervisor?.split(" ").slice(0, 2).join(" ")}
                </Grid>

                <Grid
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <WatchLaterRounded sx={{ mr: 1 }} /> Course: {user?.course}
                </Grid>
              </Grid>

              <Stack
                direction="column"
                spacing={2}
                sx={{
                  mt: "20px",
                  border: "1px solid #58041D",
                  backgroundColor: "#E9DADD",
                  borderRadius: "8px",
                  padding: "12px",
                  height: "100%",
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
              </Stack>
            </Stack>
          </Grid>

          <Grid size={8} sx={{ height: "100%" }}>
            <Stack spacing={2} sx={{ width: "100%" }}>
              <Status />
              <DashboardCalender />
            </Stack>
          </Grid>
        </Grid>
      </div>
    </>
  );
};
