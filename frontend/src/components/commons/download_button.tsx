import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

function Download_Button({
  fileUrl,
  text,
  disabled,
  variants = "outlined",
  icon = true,
}: {
  fileUrl: string | null;
  text: string;
  disabled: boolean;
  variants?: "text" | "outlined" | "contained";
  icon?: boolean;
}) {
  {
    /*  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }; */
  }
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

  return (
    <Button
      variant={variants}
      onClick={handleDownload}
      startIcon={icon ? <DownloadIcon /> : undefined}
      disabled={disabled}
    >
      {text}
    </Button>
  );
}

export default Download_Button;
