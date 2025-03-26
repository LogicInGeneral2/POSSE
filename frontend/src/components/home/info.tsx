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
        border: "1px solid #58041D",
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
            size={6}
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            <SupervisorAccountRounded sx={{ mr: 1 }} /> SUPERVISEES:{" "}
            {(supervisor.supervisees_FYP1?.length || 0) +
              (supervisor.supervisees_FYP2?.length || 0)}
          </Grid>

          <Grid
            size={6}
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            <GradingRounded sx={{ mr: 1 }} /> EVALUATEES:{" "}
            {(supervisor.evaluatees_FYP1?.length || 0) +
              (supervisor.evaluatees_FYP2?.length || 0)}
          </Grid>
        </>
      )}
    </Grid>
  );
}
