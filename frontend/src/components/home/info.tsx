import { useState, useEffect } from "react";
import {
  Box,
  Fade,
  Grid2 as Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { GradingRounded, SupervisorAccountRounded } from "@mui/icons-material";
import { useUser } from "../../../context/UserContext";
import { Student, Supervisor } from "../../services/types";

const SupervisorContents = ({
  title,
  fyp1Value,
  fyp2Value,
}: {
  title: string;
  fyp1Value: number;
  fyp2Value: number;
}) => (
  <Grid container>
    <Grid
      size={4}
      sx={{ borderRight: "1px solid", display: "flex", alignItems: "center" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "left",
          gap: "10px",
          p: "5px",
        }}
      >
        {title === "EVALUATING" ? (
          <GradingRounded sx={{ fontSize: "2rem" }} />
        ) : (
          <SupervisorAccountRounded sx={{ fontSize: "2rem" }} />
        )}
        <Stack direction="column">
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "0.75rem",
            }}
          >
            CURRENTLY
          </Typography>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "0.75rem",
            }}
          >
            {title}
          </Typography>
        </Stack>
      </Box>
    </Grid>
    <Grid size={4}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "left",
          gap: "10px",
        }}
      >
        <Typography sx={{ fontWeight: "bold", fontSize: "2rem" }}>
          {fyp1Value || 0}
        </Typography>
        <Stack direction="column">
          <Typography sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
            FYP1
          </Typography>
          <Typography sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
            STUDENTS
          </Typography>
        </Stack>
      </Box>
    </Grid>
    <Grid size={4}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "left",
          gap: "10px",
        }}
      >
        <Typography sx={{ fontWeight: "bold", fontSize: "2rem" }}>
          {fyp2Value || 0}
        </Typography>
        <Stack direction="column">
          <Typography sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
            FYP2
          </Typography>
          <Typography sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
            STUDENTS
          </Typography>
        </Stack>
      </Box>
    </Grid>
  </Grid>
);

const StudentInfo = ({ student }: { student: Student }) => {
  return (
    <Paper
      sx={{
        border: "1px solid",
        borderRadius: "8px",
        alignContent: "center",
      }}
    >
      <Grid container spacing={2}>
        <Grid
          size={6}
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "4px",
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
          <Box
            sx={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              whiteSpace: "nowrap",
              height: "1.5rem",
            }}
          >
            <Box
              sx={{
                display: "inline-block",
                whiteSpace: "nowrap",
                animation: "scroll-left 10s linear infinite",
                "@keyframes scroll-left": {
                  "0%": {
                    transform: "translateX(0%)",
                  },
                  "100%": {
                    transform: "translateX(-50%)",
                  },
                },
              }}
            >
              <Typography
                component="span"
                sx={{ paddingRight: "2rem", display: "inline-block" }}
              >
                {student.supervisor ?? "Pending..."}
              </Typography>
              <Typography
                component="span"
                sx={{ paddingRight: "2rem", display: "inline-block" }}
              >
                {student.supervisor ?? "Pending..."}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid
          size={6}
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "4px",
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
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              position: "relative",
              height: "1.5rem",
            }}
          >
            <Box
              sx={{
                display: "inline-block",
                whiteSpace: "nowrap",
                animation: "scroll-left 10s linear infinite",
                "@keyframes scroll-left": {
                  "0%": { transform: "translateX(0%)" },
                  "100%": { transform: "translateX(-50%)" },
                },
                "&:hover": {
                  animationPlayState: "paused",
                },
              }}
            >
              <Typography
                component="span"
                sx={{ paddingRight: "2rem", display: "inline-block" }}
              >
                {student.evaluators && student.evaluators.length > 0
                  ? student.evaluators.join(", ")
                  : "Pending..."}
              </Typography>
              <Typography
                component="span"
                sx={{ paddingRight: "2rem", display: "inline-block" }}
              >
                {student.evaluators && student.evaluators?.length > 0
                  ? student.evaluators.join(", ")
                  : "Pending..."}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export function Info() {
  const { user } = useUser();
  const student = user;
  const supervisor = user;
  const [showSupervising, setShowSupervising] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSupervising((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      {user?.role === "student" ? (
        <StudentInfo student={student as Student} />
      ) : (
        <Paper
          sx={{
            borderRadius: "8px",
            border: "1px solid",
          }}
        >
          <Grid container spacing={2}>
            <Fade in={showSupervising} timeout={500}>
              <Box
                sx={{
                  display: showSupervising ? "block" : "none",
                  width: "100%",
                }}
              >
                <SupervisorContents
                  title="SUPERVISING"
                  fyp1Value={(supervisor as Supervisor).supervisees_FYP1 || 0}
                  fyp2Value={(supervisor as Supervisor).supervisees_FYP2 || 0}
                />
              </Box>
            </Fade>
            <Fade in={!showSupervising} timeout={500}>
              <Box
                sx={{
                  display: !showSupervising ? "block" : "none",
                  width: "100%",
                }}
              >
                <SupervisorContents
                  title="EVALUATING"
                  fyp1Value={(supervisor as Supervisor).evaluatees_FYP1 || 0}
                  fyp2Value={(supervisor as Supervisor).evaluatees_FYP2 || 0}
                />
              </Box>
            </Fade>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
