import { Box, Divider, Typography } from "@mui/material";
import FileUpload from "./view";
import { CanvasProvider } from "./canvas";
import { useLocation, useSearchParams } from "react-router";
import Breadcrumb from "../commons/breadcrumbs";

export const ViewingPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const studentId =
    searchParams.get("student") || location.state.rowData?.student?.id;
  const studentName =
    searchParams.get("name") || location.state.rowData?.student?.name;
  const category = searchParams.get("category") || location.state?.category;
  const submissionId = searchParams.get("submission");

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
          Viewing
        </Typography>
        <Breadcrumb
          receivedName={studentName}
          category={category || "supervisor"}
          currentPage="Viewing"
        />
        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
        <Box sx={{ marginTop: "20px" }}>
          <CanvasProvider>
            <FileUpload
              student={studentId}
              submission={Number(submissionId) || undefined}
            />
          </CanvasProvider>
        </Box>
      </div>
    </>
  );
};
