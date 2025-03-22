import PersonIcon from "@mui/icons-material/Person";
import { Box, Divider, Grid2 as Grid, Typography } from "@mui/material";
import GradingStepper from "./stepper";

export const GradingPage = () => {
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
          <PersonIcon sx={{ mr: 1, fontSize: "2rem" }} />
          Currently Grading: A
        </Box>

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
              backgroundColor: "#E9DADD",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid",
            }}
          >
            <GradingStepper pic="supervisor" />
          </Grid>
          <Grid size={4} sx={{ height: "100%" }}>
            <iframe
              src="../../../data/PSM-1-Rubric.pdf"
              width="100%"
              height="100%"
              style={{ border: "none", borderRadius: "8px" }}
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};
