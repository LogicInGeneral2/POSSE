import React from "react";
import { format } from "date-fns";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Divider, Stack } from "@mui/material";
import { LogType, periodTypes } from "../../services/types";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotesIcon from "@mui/icons-material/Notes";
import FeedbackIcon from "@mui/icons-material/Feedback";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router";
import { DetailRow } from "./EventDetails";

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  selectedEvent: any;
}

const EventModal: React.FC<EventModalProps> = ({
  open,
  onClose,
  selectedEvent,
}) => {
  const navigate = useNavigate();

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          ...modalStyle,
          borderRadius: "8px",
          boxShadow: 24,
          p: 4,
          width: 400,
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        {/* Title */}
        <Typography variant="h5" fontWeight={600} mb={2}>
          {selectedEvent?.title || "No Title"}
        </Typography>

        {/* Divider */}
        <Divider sx={{ mb: 2 }} />

        {/* Details Section */}
        <Stack spacing={2}>
          {selectedEvent?.tag === "period" && selectedEvent?.details && (
            <>
              <DetailRow
                icon={<DescriptionIcon color="primary" />}
                label="Description"
                value={(
                  selectedEvent.details as periodTypes
                ).description.toString()}
              />

              <DetailRow
                icon={<CalendarTodayIcon color="primary" />}
                label="Start Date"
                value={format(
                  (selectedEvent.details as periodTypes).start_date,
                  "dd-MM-yyyy"
                )}
              />
              <DetailRow
                icon={<CalendarTodayIcon color="primary" />}
                label="End Date"
                value={format(
                  (selectedEvent.details as periodTypes).end_date,
                  "dd-MM-yyyy"
                )}
              />
              <DetailRow
                icon={<AccessTimeIcon color="primary" />}
                label="Days Left"
                value={
                  (
                    selectedEvent.details as periodTypes
                  ).days_left?.toString() ?? "N/A"
                }
              />
            </>
          )}

          {selectedEvent?.tag === "log" && selectedEvent?.details && (
            <>
              <DetailRow
                icon={<NotesIcon color="primary" />}
                label="Activities"
                value={(selectedEvent.details as LogType).activities}
              />
              <DetailRow
                icon={<FeedbackIcon color="primary" />}
                label="Feedbacks"
                value={(selectedEvent.details as LogType).feedbacks}
              />
              <DetailRow
                icon={<ChecklistIcon color="primary" />}
                label="Plan"
                value={(selectedEvent.details as LogType).plan}
              />
            </>
          )}
        </Stack>

        {/* Buttons */}
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          mt={4}
        >
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
          {selectedEvent?.tag === "log" && (
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/logs")}
            >
              Details
            </Button>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};

export default EventModal;
