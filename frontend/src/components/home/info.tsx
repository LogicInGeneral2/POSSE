import { GradingRounded, SupervisorAccountRounded } from "@mui/icons-material";
import { Grid2 as Grid, Tooltip } from "@mui/material";
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
        border: "1px solid",
        borderRadius: "8px",
        alignContent: "center",
      }}
    >
      {user?.role === "student" ? (
        <>
          <Grid
            size={6}
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
              whiteSpace: "nowrap",
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Tooltip
              title="Assigned Supervisor"
              placement="top"
              arrow
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -8],
                      },
                    },
                  ],
                },
              }}
            >
              <SupervisorAccountRounded sx={{ mr: 1 }} />
            </Tooltip>
            {student.supervisor ? student.supervisor : " Pending..."}
          </Grid>

          <Grid
            size={6}
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
              whiteSpace: "nowrap",
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Tooltip
              title="Assigned Examiners"
              placement="top"
              arrow
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -8],
                      },
                    },
                  ],
                },
              }}
            >
              <GradingRounded sx={{ mr: 1 }} />
            </Tooltip>
            {student.evaluators && student.evaluators.length > 0
              ? student.evaluators.slice(0, 3).join(", ")
              : "Pending..."}
          </Grid>
        </>
      ) : (
        <>
          <Grid
            size={3}
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            {" "}
            <Tooltip
              title="Assigned FYP1 Supervisees"
              placement="top"
              arrow
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -8],
                      },
                    },
                  ],
                },
              }}
            >
              <SupervisorAccountRounded sx={{ mr: 0.5 }} />
            </Tooltip>
            FYP1: {supervisor.supervisees_FYP1 || 0}
          </Grid>
          <Grid
            size={3}
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            {" "}
            FYP2: {supervisor.supervisees_FYP2 || 0}
          </Grid>
          <Grid
            size={3}
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            {" "}
            <Tooltip
              title="Assigned FYP1 Evaluatees"
              placement="top"
              arrow
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -8],
                      },
                    },
                  ],
                },
              }}
            >
              <GradingRounded sx={{ mr: 0.5 }} />
            </Tooltip>{" "}
            FYP1: {supervisor.evaluatees_FYP1 || 0}
          </Grid>{" "}
          <Grid
            size={3}
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            {" "}
            FYP2:
            {supervisor.evaluatees_FYP2 || 0}
          </Grid>
        </>
      )}
    </Grid>
  );
}
