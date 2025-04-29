import { Box, Typography } from "@mui/material";
import { AnnouncementTypes } from "../../services/types";
import PDFViewer from "../commons/pdfviewer";
import Download_Button from "../commons/download_button";

export function Item({ item }: { item: AnnouncementTypes }) {
  return (
    <Box
      sx={{
        gap: "1rem",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <Typography sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>
        {item.title}
      </Typography>
      <Typography>{item.message}</Typography>{" "}
      <Download_Button
        fileUrl={item.src}
        text="Download Attachment"
        disabled={false}
      />
      <PDFViewer src={item.src} />
    </Box>
  );
}
