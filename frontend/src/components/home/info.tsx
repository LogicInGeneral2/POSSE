import {
  SupervisorAccountRounded,
  WatchLaterRounded,
} from "@mui/icons-material";
import { Grid2 as Grid } from "@mui/material";
import { useUser } from "../../../context/UserContext";
import { Student, Supervisor } from "../../services/types";

export function Info() {
  const { user } = useUser();
  const student = user as Student;
  const supervisor = user as Supervisor;

  return (
    <Grid
      container
      spacing={2}
      sx={{
        border: "1px solid #58041D",
        borderRadius: "8px",
        alignContent: "center",
      }}
    >
      {user?.role === "student" ? (
        <>
          <Grid
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            <SupervisorAccountRounded sx={{ mr: 1 }} /> Supervisor:
            {student.supervisor
              ? student.supervisor?.split(" ").slice(0, 2).join(" ")
              : " Pending..."}
          </Grid>

          <Grid
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <WatchLaterRounded sx={{ mr: 1 }} /> Course: {student.course}
          </Grid>
        </>
      ) : (
        <>
          <Grid
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            <SupervisorAccountRounded sx={{ mr: 1 }} /> Supervisor:{" "}
            {supervisor.supervisees_FYP1?.length}
          </Grid>

          <Grid
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            <SupervisorAccountRounded sx={{ mr: 1 }} /> Supervisor:{" "}
            {supervisor.supervisees_FYP2?.length}
          </Grid>
        </>
      )}
    </Grid>
  );
}
