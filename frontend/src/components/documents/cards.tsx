import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Tooltip,
  Typography,
} from "@mui/material";
import { DocumentType } from "../../services/types";
import { format } from "date-fns";
import ErrorNotice from "../commons/error";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import ScienceIcon from "@mui/icons-material/Science";

// Hardcoded category-based colors
const categoryColors: Record<string, { primary: string; secondary: string }> = {
  marking_scheme: { primary: "#FFF3E0", secondary: "#EF6C00" }, // soft orange
  lecture_notes: { primary: "#E3F2FD", secondary: "#1976D2" }, // light blue
  samples: { primary: "#E8F5E9", secondary: "#388E3C" }, // light green
  templates: { primary: "#F3E5F5", secondary: "#8E24AA" }, // light purple
  forms: { primary: "#FFFDE7", secondary: "#FBC02D" }, // light yellow
  other: { primary: "#ECEFF1", secondary: "#455A64" }, // grey
};

// File downloader
export const getFile = async (fileUrl: string) => {
  try {
    if (!fileUrl) return;
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      fileUrl.substring(fileUrl.lastIndexOf("/") + 1) || "download.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

function FileCard({ file }: { file: DocumentType }) {
  const colors = categoryColors[file.category] || {
    primary: "#ffffff",
    secondary: "#58041D",
  };

  if (!file) {
    return <ErrorNotice />;
  }

  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 345,
        backgroundColor: colors.primary,
        borderRadius: "8px",
        border: "1px solid",
      }}
    >
      <CardActionArea onClick={() => getFile(file.src)}>
        <CardMedia
          component="img"
          height="140"
          image={file.thumbnail_url}
          alt={file.title}
        />
        <CardContent
          sx={{
            paddingLeft: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              color: colors.secondary,
            }}
          >
            <Box>
              <Typography
                gutterBottom
                variant="h6"
                component="div"
                sx={{ px: 1, pt: 1 }}
              >
                {file.title}
              </Typography>
              <Typography variant="body2" sx={{ px: 1, pb: 1 }}>
                {format(file.upload_date, "d MMMM yyyy")}
              </Typography>
            </Box>
            <Box sx={{ px: 1, py: 1 }}>
              <Tooltip title={file.mode}>
                {file.mode === "Research" ? (
                  <ScienceIcon sx={{ fontSize: 50 }} />
                ) : (
                  <DeveloperModeIcon sx={{ fontSize: 50 }} />
                )}
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default FileCard;
