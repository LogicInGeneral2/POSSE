import { SupervisorAccountRounded } from "@mui/icons-material";
import { Box, Divider, Paper, Typography } from "@mui/material";
import SupervisorsTable from "./table";
import { useUser } from "../../../context/UserContext";
import ErrorNotice from "../commons/error";
import { useEffect, useState } from "react";
import { getSupervisor } from "../../services";

export const SupervisorsPage = () => {
  const { user } = useUser();
  const [supervisor, setSupervisor] = useState<string>("");

  useEffect(() => {
    const fetchSupervisor = async () => {
      const data = await getSupervisor();
      setSupervisor(data.data);
    };
    fetchSupervisor();
  }, []);

  if (!user || user.role !== "student") {
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
          Supervisor Selection
        </Typography>

        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
        <Paper
          elevation={3}
          sx={{
            marginTop: "20px",
            marginBottom: "40px",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          <SupervisorAccountRounded sx={{ mr: 1, fontSize: "2rem" }} />
          <Typography variant="h6" color="inherit">
            Assigned Supervisor: {supervisor ? supervisor : "Pending..."}
          </Typography>
        </Paper>
        <Box
          sx={{
            marginTop: "20px",

            display: "flex",
            flexDirection: "column",
            gap: "20px",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              borderRadius: "8px",
              backgroundColor: "base.main",
              padding: "20px",
            }}
          >
            <SupervisorsTable supervisor={supervisor} />
          </Box>
        </Box>
      </div>
    </>
  );
};
