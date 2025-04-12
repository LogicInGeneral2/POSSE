import { Box, Divider, Typography } from "@mui/material";
import FileUpload from "./view";
import { CanvasProvider } from "./canvas";
import { useLocation, useSearchParams } from "react-router";
import Breadcrumb from "../commons/breadcrumbs";

export const ViewingPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const studentName =
    searchParams.get("name") || location.state.rowData?.student?.name;
  const studentId =
    searchParams.get("student") || location.state.rowData?.student?.id;
  const studentLists = location.state?.lists || [];
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
          Viewing
        </Typography>
        <Breadcrumb
          receivedName={studentName}
          category={category}
          currentPage="Viewing"
          lists={studentLists}
        />
        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
        <Box sx={{ marginTop: "20px" }}>
          <CanvasProvider>
            <FileUpload student={studentId} />
          </CanvasProvider>
        </Box>
      </div>
    </>
  );
};
