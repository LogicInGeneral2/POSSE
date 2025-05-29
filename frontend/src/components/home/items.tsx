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
      <Typography
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "auto", // allows scrolling
          textOverflow: "ellipsis",
          maxHeight: "4.5em", // roughly 3 lines
        }}
      >
        {item.message}
      </Typography>
      {item.src && (
        <>
          <Download_Button
            fileUrl={item.src}
            text="Download Attachment"
            disabled={false}
          />
          <PDFViewer src={item.src} />
        </>
      )}
    </Box>
  );
}
