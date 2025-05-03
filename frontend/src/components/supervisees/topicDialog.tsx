import { useState } from "react";
import {
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { updateStudentTopic } from "../../services";
import Toast from "../commons/snackbar";

interface TopicDialogProps {
  setOpenDialog: (open: boolean) => void;
  id: number;
  initialTopic?: string | null;
  onRefresh?: () => void;
}

export default function TopicDialog({
  setOpenDialog,
  id,
  initialTopic,
  onRefresh,
}: TopicDialogProps) {
  const [topicInput, setTopicInput] = useState(initialTopic || "");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );

  const handleSave = async () => {
    if (!topicInput.trim()) {
      setToastMessage("Topic cannot be empty.");
      setToastSeverity("error");
      setToastOpen(true);
      return;
    }

    if (topicInput.length > 255) {
      setToastMessage("Topic cannot exceed 255 characters.");
      setToastSeverity("error");
      setToastOpen(true);
      return;
    }

    try {
      await updateStudentTopic(id, topicInput);
      setToastMessage("Topic updated successfully.");
      setToastSeverity("success");
      setToastOpen(true);
    } catch (err: any) {
      setToastMessage(err.message || "Failed to update topic.");
      setToastSeverity("error");
      setToastOpen(true);
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleToastClose = () => {
    setToastOpen(false);
    setToastMessage("");
    setOpenDialog(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Box>
      <DialogContent>
        <TextField
          fullWidth
          label="Student Topic"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          variant="outlined"
          multiline
          rows={3}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={handleToastClose}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Box>
  );
}
