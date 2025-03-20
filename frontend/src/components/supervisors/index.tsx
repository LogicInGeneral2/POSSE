import { ErrorRounded, SupervisorAccountRounded } from "@mui/icons-material";
import { Box, Divider, Typography } from "@mui/material";
import SupervisorsTable from "./table";

export const SupervisorsPage = () => {
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
          Supervisor Selection
        </Typography>

        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
        <Box
          sx={{
            marginTop: "20px",
            fontSize: "1rem",
            padding: "5px",
            border: "1px solid",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          <SupervisorAccountRounded sx={{ mr: 1, fontSize: "2rem" }} />
          Assigned Supervisor: Selections Pending...
        </Box>
        <Box
          sx={{
            marginTop: "20px",
            backgroundColor: "#E9DADD",
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <ErrorRounded sx={{ mr: 1, mt: 0.5, fontSize: "1rem" }} />
            <Typography
              sx={{
                fontSize: "1rem",
                textAlign: "left",
              }}
            >
              Supervisor Selection Period is currently ongoing. Rank your top
              three preffered supervisors. Alternatively, add a new supervisor
              below if they are not from the SE program, together with a
              screenshot as a proof of agreement.
            </Typography>
          </Box>
          <Box>
            <SupervisorsTable />
          </Box>
        </Box>
      </div>
    </>
  );
};
