import { useState, useEffect } from "react";
import { Container, Divider, Typography } from "@mui/material";
import { MarkingScheme, TotalMarks } from "../../services/types";
import { fetchAllTotalMarks, fetchMarkingSchemes } from "../../services";
import TotalMarksTable from "./TotalMarksTable";
import Toast from "../commons/snackbar";
import LoadingSpinner from "../commons/loading";

export const GradesPage = () => {
  const [totalMarks, setTotalMarks] = useState<TotalMarks[]>([]);
  const [markingSchemes, setMarkingSchemes] = useState<MarkingScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "info" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [totalMarksData, schemesData] = await Promise.all([
          fetchAllTotalMarks(),
          fetchMarkingSchemes(""),
        ]);
        setTotalMarks(totalMarksData);
        console.log(totalMarksData);
        setMarkingSchemes(schemesData);
        setLoading(false);
      } catch (error: any) {
        setToast({
          open: true,
          message: "Failed to load data",
          severity: "error",
        });
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <div style={{ height: "100%" }}>
      <Typography fontSize={"3rem"} color="primary" sx={{ fontWeight: "bold" }}>
        Student Grades
      </Typography>
      <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
      <TotalMarksTable
        totalMarks={totalMarks}
        markingSchemes={markingSchemes}
      />
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
};
