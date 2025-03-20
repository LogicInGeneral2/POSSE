import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { colorOptions } from "../../modals/documents";

interface DocumentsType {
  id: number;
  title: string;
  category: string;
  uploadDate: string;
  thumbnail: string;
  src: string;
}

function FileCard({ file }: { file: DocumentsType }) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.src;
    link.download = file.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const colors = colorOptions.find(
    (color) => color.value === file.category
  ) || { primary: "#ffffff", secondary: "#58041D" };

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
      <CardActionArea onClick={handleDownload}>
        <CardMedia
          component="img"
          height="140"
          image={file.thumbnail}
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
            {file.uploadDate}
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
