import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { LogType } from "../../services/types";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { status_info } from "./status";
import { updateLogbookStatus } from "../../services";
import ConfirmationDialog from "../commons/confirmation";
import Toast from "../commons/snackbar";

interface DetailsProps {
  selectedLog: LogType | null;
  onSave: (updatedLog: LogType) => void;
  onDelete: (id: number) => void;
  userRole: string | null;
}

export default function Details({
  selectedLog,
  onSave,
  onDelete,
  userRole,
}: DetailsProps) {
  const [logDetails, setLogDetails] = useState<LogType | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    isLoading: boolean;
  }>({
    open: false,
    isLoading: false,
  });
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    setLogDetails(selectedLog);
  }, [selectedLog]);

  if (!logDetails) {
    return (
      <Paper
        sx={{
          overflow: "auto",
          height: "100%",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 2,
        }}
      >
        <PriorityHighIcon sx={{ mr: 2, fontSize: "4rem" }} />
        <Typography variant="h5">
          Select a log entry to view details. Alternatively, select a date from
          the calendar to create a new entry.
        </Typography>
      </Paper>
    );
  }

  // Get status details
  const statusDetail = status_info.find(
    (info) => info.value === logDetails.status
  ) || {
    value: "N/A",
    color: "default",
    icon: <></>,
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogDetails((prev) =>
      prev ? { ...prev, [event.target.name]: event.target.value } : null
    );
  };

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      const formattedDate = format(newDate, "yyyy-MM-dd");
      setLogDetails((prev) => (prev ? { ...prev, date: formattedDate } : null));
    }
  };

  const handleSave = async () => {
    if (logDetails) {
      const updatedLog =
        userRole === "student"
          ? { ...logDetails, status: "sent", comment: "" }
          : logDetails;
      onSave(updatedLog);
    }
  };

  const handleDelete = async () => {
    setConfirmDialog((prev) => ({ ...prev, open: true }));
  };

  const handleConfirmDelete = async () => {
    onDelete(logDetails.id);
    setConfirmDialog({ open: false, isLoading: false });
  };

  const handleApprove = async () => {
    if (logDetails && logDetails.status !== "approved") {
      try {
        const result = await updateLogbookStatus(logDetails.id, "approved");
        const updatedLog = { ...logDetails, status: "approved" };
        setLogDetails(updatedLog);
        onSave(updatedLog);
        setToast({
          open: true,
          message: result.data.detail || "Logbook approved successfully.",
          severity: "success",
        });
      } catch (error: any) {
        console.error("Failed to approve logbook:", error);
        setToast({
          open: true,
          message: error.detail || "Failed to approve logbook.",
          severity: "error",
        });
      }
    }
  };

  const handleSendFeedback = async () => {
    if (logDetails && logDetails.comment?.trim()) {
      try {
        const result = await updateLogbookStatus(
          logDetails.id,
          "feedback",
          logDetails.comment
        );
        const updatedLog = { ...logDetails, status: "feedback" };
        setLogDetails(updatedLog);
        onSave(updatedLog);
        setToast({
          open: true,
          message: result.data.detail || "Feedback sent successfully.",
          severity: "success",
        });
      } catch (error: any) {
        console.error("Failed to send feedback:", error);
        setToast({
          open: true,
          message: error.detail || "Failed to send feedback.",
          severity: "error",
        });
      }
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, isLoading: false });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <Paper sx={{ overflow: "auto", height: "100%", borderRadius: "8px", p: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        divider={
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderWidth: 1, borderColor: "primary.main" }}
          />
        }
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" fontWeight="bold">
          Log Details
        </Typography>
        <Chip
          label={statusDetail.value.toUpperCase()}
          icon={statusDetail.icon}
          color={statusDetail.color}
          variant="outlined"
        />
      </Stack>

      <DatePicker
        label="Date"
        value={logDetails?.date ? new Date(logDetails.date) : null}
        onChange={handleDateChange}
        slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
        disabled={userRole === "supervisor" || logDetails.status === "approved"}
      />
      <TextField
        fullWidth
        multiline
        label="Activities"
        name="activities"
        value={logDetails.activities}
        onChange={handleChange}
        margin="normal"
        disabled={userRole === "supervisor" || logDetails.status === "approved"}
      />
      <TextField
        fullWidth
        multiline
        label="Feedbacks"
        name="feedbacks"
        value={logDetails.feedbacks}
        onChange={handleChange}
        margin="normal"
        disabled={userRole === "supervisor" || logDetails.status === "approved"}
      />
      <TextField
        fullWidth
        multiline
        label="Plan"
        name="plan"
        value={logDetails.plan}
        onChange={handleChange}
        margin="normal"
        disabled={userRole === "supervisor" || logDetails.status === "approved"}
      />
      <TextField
        fullWidth
        multiline
        label="Feedback"
        name="comment"
        value={logDetails.comment || ""}
        onChange={handleChange}
        margin="normal"
        disabled={
          userRole === "student" ||
          logDetails.status === "feedback" ||
          logDetails.status === "approved"
        }
      />

      {userRole === "supervisor" ? (
        <>
          <Divider sx={{ my: 2 }} />

          {logDetails.status !== "approved" && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
            >
              <Button
                variant="contained"
                color="info"
                onClick={handleSendFeedback}
                disabled={
                  logDetails.status === "feedback" ||
                  !logDetails.comment?.trim()
                }
                sx={{ flex: 1 }}
              >
                {logDetails.status === "feedback"
                  ? "Feedback Sent"
                  : "Send Feedback"}
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleApprove}
                disabled={!logDetails.status || logDetails.status !== "sent"}
                sx={{ flex: 1 }}
              >
                {logDetails.status === "approved" ? "Approved" : "Approve"}
              </Button>
            </Box>
          )}
        </>
      ) : null}

      {userRole === "student" && logDetails.status !== "approved" && (
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </Box>
      )}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
      <ConfirmationDialog
        open={confirmDialog.open}
        title="Delete Log Entry"
        message="Are you sure you want to delete this log entry? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={confirmDialog.isLoading}
      />
    </Paper>
  );
}
