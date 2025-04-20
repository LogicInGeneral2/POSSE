import { ErrorRounded, SupervisorAccountRounded } from "@mui/icons-material";
import { Box, Divider, Typography } from "@mui/material";
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
      console.log(data);
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
          Assigned Supervisor: {supervisor ? supervisor : " Pending..."}
        </Box>
        <Box
          sx={{
            marginTop: "20px",
            backgroundColor: "base.main",
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
              Supervisor Selection Period is currently ongoing. Select your FYP
              mode and topic (if any) and Rank your top three preffered
              supervisors. Alternatively, add a new supervisor below if they are
              not from the SE program, together with a screenshot as a proof of
              agreement. *Type in a name to add new lecturers.
            </Typography>
          </Box>
          <Box>
            <SupervisorsTable supervisor={supervisor} />
          </Box>
        </Box>
      </div>
    </>
  );
};
