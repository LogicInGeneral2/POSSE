import { Box, Divider, Typography } from "@mui/material";
import FileUpload from "./view";
import { CanvasProvider } from "./canvas";

export const ViewingPage = () => {
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
        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />

        <Box sx={{ marginTop: "20px" }}>
          <CanvasProvider>
            <FileUpload src={"../../../data/CO.pdf"} />
          </CanvasProvider>
        </Box>
      </div>
    </>
  );
};
