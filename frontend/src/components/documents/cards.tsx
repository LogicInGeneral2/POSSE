import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { ColorType, DocumentType } from "../../services/types";
import { format } from "date-fns";
import { getDocumentColours } from "../../services";
import { useEffect, useState } from "react";
import ErrorNotice from "../commons/error";

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
  const [colours, setColors] = useState<ColorType[]>([]);
  const colors = colours.find(
    (color: { value: string }) => color.value === file.category
  ) || { primary: "#ffffff", secondary: "#58041D" };

  useEffect(() => {
    const fetchColours = async () => {
      const data: ColorType[] = (await getDocumentColours()).data;
      setColors(data);
    };
    fetchColours();
  }, []);

  if (!colours) {
    return <ErrorNotice />;
  }

  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 345,
        backgroundColor: colors.primary,
        borderRadius: "8px",
        border: "1px solid #58041D",
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
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              paddingLeft: 1,
              paddingRight: 1,
              paddingBottom: 0,
              paddingTop: 1,
              color: colors.secondary,
            }}
          >
            {file.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.secondary,
              paddingLeft: 1,
              paddingRight: 1,
              paddingBottom: 1,
              paddingTop: 0,
            }}
          >
            {format(file.upload_date, "d MMMM yyyy")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.primary,
              textAlign: "right",
              backgroundColor: colors.secondary,
              padding: 1,
            }}
          >
            {file.category}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default FileCard;
