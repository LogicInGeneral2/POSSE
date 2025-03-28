import {
  Box,
  Button,
  Chip,
  Divider,
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

interface DetailsProps {
  selectedLog: LogType | null;
  onSave: (updatedLog: LogType) => void;
  onDelete: (id: number) => void;
  userRole: string | null;
}

const mockSaveLog = async (log: LogType) => {
  console.log("Saving log:", log);
  return new Promise((resolve) => setTimeout(() => resolve(log), 1000));
};

const mockDeleteLog = async (id: number) => {
  console.log("Deleting log with ID:", id);
  return new Promise((resolve) => setTimeout(() => resolve(id), 1000));
};

export default function Details({
  selectedLog,
  onSave,
  onDelete,
  userRole,
}: DetailsProps) {
  const [logDetails, setLogDetails] = useState<LogType | null>(null);

  useEffect(() => {
    setLogDetails(selectedLog);
  }, [selectedLog]);

  if (!logDetails) {
    return (
      <Box
        p={2}
        sx={{
          overflow: "auto",
          height: "100%",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <PriorityHighIcon sx={{ mr: 2, fontSize: "4rem" }} />
        <Typography variant="h5">
          Select a log entry to view details. Alternatively, select a date from
          the calendar to create a new entry.
        </Typography>
      </Box>
    );
  }

  // Get status details
  const statusDetail = status_info.find(
    (info) => info.value === logDetails.status
  ) || {
    value: "Unknown",
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
      await mockSaveLog(logDetails);
      onSave(logDetails);
    }
  };

  const handleDelete = async () => {
    await mockDeleteLog(logDetails.id);
    onDelete(logDetails.id);
  };

  const handleApprove = async () => {
    if (logDetails && logDetails.status !== "Approved") {
      const updatedLog = { ...logDetails, status: "Approved" };
      await mockSaveLog(updatedLog);
      setLogDetails(updatedLog);
      onSave(updatedLog);
    }
  };

  return (
    <Box p={2} sx={{ overflow: "auto", height: "100%", borderRadius: "8px" }}>
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
          label={statusDetail.value}
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
        disabled={userRole === "supervisor"}
      />
      <TextField
        fullWidth
        multiline
        label="Activities"
        name="activities"
        value={logDetails.activities}
        onChange={handleChange}
        margin="normal"
        disabled={userRole === "supervisor"}
      />
      <TextField
        fullWidth
        multiline
        label="Feedbacks"
        name="feedbacks"
        value={logDetails.feedbacks}
        onChange={handleChange}
        margin="normal"
        disabled={userRole === "supervisor"}
      />
      <TextField
        fullWidth
        multiline
        label="Plan"
        name="plan"
        value={logDetails.plan}
        onChange={handleChange}
        margin="normal"
        disabled={userRole === "supervisor"}
      />

      {userRole === "supervisor" ? (
        <Button
          variant="contained"
          color="success"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleApprove}
          disabled={logDetails.status === "Approved"}
        >
          {logDetails.status === "Approved" ? "Approved" : "Approve"}
        </Button>
      ) : null}

      {userRole === "student" && (
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </Box>
      )}
    </Box>
  );
}
