import { Box, Divider, Grid2 as Grid, Typography } from "@mui/material";
import GradingStepper from "./stepper";
import { useLocation, useSearchParams } from "react-router";
import Breadcrumb from "../commons/breadcrumbs";
import PDFViewer from "../commons/pdfviewer";
import { useEffect, useState } from "react";
import { getMarkingSchemeDoc } from "../../services";
import LoadingSpinner from "../commons/loading";

export const GradingPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const studentName =
    searchParams.get("name") || location.state.rowData?.student?.name;
  const studentId =
    searchParams.get("student") || location.state.rowData?.student?.id;
  const category = location.state?.category || "supervisor";
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const src = await getMarkingSchemeDoc("PSM1");
        setPdfUrl(src.data.src);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };
    fetchDoc();
  }, []);
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
            lists={location.state?.lists}
          />
        </Box>

        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
        <Grid
          container
          spacing={4}
          sx={{
            marginTop: "20px",
            height: "calc(100vh - 240px)",
          }}
        >
          <Grid
            size={7}
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
              <GradingStepper student={studentId} />
            </Box>
          </Grid>
          <Grid
            size={5}
            sx={{
              height: "calc(100vh - 220px)",
            }}
          >
            {isLoading || !pdfUrl ? (
              <LoadingSpinner />
            ) : (
              <PDFViewer src={pdfUrl} customHeight="calc(100vh - 200px)" />
            )}
          </Grid>
        </Grid>
      </div>
    </>
  );
};
