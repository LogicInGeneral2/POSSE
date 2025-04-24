import { Alert, Snackbar } from "@mui/material";
import { ReactNode } from "react";

interface ToastProps {
  open: boolean;
  message: string | ReactNode;
  severity: "success" | "error" | "info" | "warning";
  onClose: () => void;
  autoHideDuration?: number;
  anchorOrigin?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };
}

export default function Toast({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 3000,
  anchorOrigin = { vertical: "bottom", horizontal: "right" },
}: ToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
        onClose={onClose}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
