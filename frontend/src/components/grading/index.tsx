import PersonIcon from "@mui/icons-material/Person";
import { Box, Divider, Grid2 as Grid, Typography } from "@mui/material";
import GradingStepper from "./stepper";
import { useLocation } from "react-router";
import { GradingRounded } from "@mui/icons-material";

export const GradingPage = () => {
  const location = useLocation();
  const rowData = location.state?.rowData;
  const category = location.state?.category;
  const student = rowData?.student;

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
          Grading
        </Typography>
        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />

        <Grid
          container
          spacing={4}
          sx={{
            marginTop: "20px",
            height: "calc(100vh - 320px)",
          }}
        >
          <Grid
            size={8}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                marginBottom: "20px",
                fontSize: "1rem",
                padding: "5px",
                border: "1px solid",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
                gap: "2rem",
              }}
            >
              <Typography sx={{ display: "flex", alignItems: "center" }}>
                <PersonIcon sx={{ mr: 1, fontSize: "2rem" }} />
                Currently Grading: {student.name}
              </Typography>
              <Typography sx={{ display: "flex", alignItems: "center" }}>
                <GradingRounded sx={{ mr: 1, fontSize: "2rem" }} />
                Grading As: {student.name}
              </Typography>
            </Box>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#E9DADD",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid",
              }}
            >
              <GradingStepper pic={category} student={student.id} />
            </Box>
          </Grid>
          <Grid
            size={4}
            sx={{
              height: "calc(100vh - 220px)",
            }}
          >
            <iframe
              src="../../../data/PSM-1-Rubric.pdf"
              width="100%"
              height="100%"
              style={{
                border: "none",
                borderRadius: "8px",
              }}
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};
