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
  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
