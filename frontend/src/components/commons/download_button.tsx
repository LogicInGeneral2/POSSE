import { Button, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

function Download_Button({
  fileUrl,
  text,
  disabled,
  variants = "outlined",
  icon = true,
  size = "medium",
}: {
  fileUrl: string | null;
  text?: string;
  disabled: boolean;
  variants?: "text" | "outlined" | "contained";
  icon?: boolean;
  size?: "small" | "medium" | "large";
}) {
  const handleDownload = async () => {
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

  return text ? (
    <Button
      variant={variants}
      onClick={handleDownload}
      startIcon={icon ? <DownloadIcon /> : undefined}
      disabled={disabled}
      size={size}
    >
      {text}
    </Button>
  ) : (
    <IconButton onClick={handleDownload} disabled={disabled} color="primary">
      <DownloadIcon />
    </IconButton>
  );
}

export default Download_Button;
