import { Stack, Typography, Divider, Grid2 as Grid } from "@mui/material";
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
          color="secondary"
          sx={{ fontWeight: "bold" }}
        >
          Welcome back, {user.name.split(" ").slice(0, 2).join(" ")}
        </Typography>

        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
        <Grid container spacing={2} sx={{ marginTop: "20px", height: "100%" }}>
          <Grid size={4} sx={{ height: "100%" }}>
            <Stack direction="column" sx={{ height: "100%" }}>
              <Info />
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
              <Status isStudent={user.role === "student" ? true : false} />
              <DashboardCalender />
            </Stack>
          </Grid>
        </Grid>
      </div>
    </>
  );
};
