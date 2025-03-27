import { Box, Divider, Grid2 as Grid, Typography } from "@mui/material";
import GradingStepper from "./stepper";
import { useLocation, useSearchParams } from "react-router";
import Breadcrumb from "../commons/breadcrumbs";

export const GradingPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const studentName =
    searchParams.get("name") || location.state.rowData?.student?.name;
  const studentId =
    searchParams.get("student") || location.state.rowData?.student?.id;
  const category = location.state?.category || "supervisor";

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
          Submissions & Grading
        </Typography>
        <Box sx={{ justifyContent: "space-between", display: "flex" }}>
          <Breadcrumb
            receivedName={studentName}
            category={category}
            currentPage="Grading"
          />
        </Box>

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
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#E9DADD",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid",
              }}
            >
              <GradingStepper pic={category} student={studentId} />
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
