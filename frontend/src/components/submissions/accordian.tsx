import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  ErrorRounded,
  EventAvailableRounded,
  EventBusyRounded,
  HourglassBottom,
  OutboxRounded,
} from "@mui/icons-material";
import { status_info } from "../../modals/submissions";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import React, { useState } from "react";
import {
  FeedbackType,
  SubmissionsMetaType,
  SubmissionType,
} from "../../services/types";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
}) as React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>;

function SubmissionCards({
  submission,
  feedback,
  meta,
}: {
  submission: SubmissionType | null;
  feedback: FeedbackType | null;
  meta: SubmissionsMetaType;
}) {
  const themes = status_info.find((color) => color.value === meta.status) || {
    color: "#ffffff",
    icon: (
      <ErrorRounded
        sx={{
          mr: 1,
          fontSize: "1.5rem",
          backgroundColor: "#ffda07",
          height: "3.25rem",
          width: "2rem",
          padding: "0.25rem",
          borderRight: "1px solid",
          borderTopLeftRadius: "8px",
        }}
      />
    ),
  };

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setUploadedFile(event.target.files[0]); // Replace previous file
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleDownload = (src: string, title: string) => {
    const link = document.createElement("a");
    link.href = src;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = () => {
    console.log("Submitting file:", uploadedFile);
  };

  return (
    <Accordion sx={{ m: 0, p: 0 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id="submissions-header"
        sx={{
          backgroundColor: "#E9DADD",
          border: "1px solid",
          borderTopRightRadius: "8px",
          borderTopLeftRadius: "8px",
        }}
      >
        <Stack direction="row" spacing={2}>
          {themes.icon}
          <Box>
            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                paddingTop: "0.25rem",
              }}
            >
              {meta.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {[
                {
                  icon: <EventAvailableRounded sx={{ fontSize: "1rem" }} />,
                  text: meta.date_open,
                },
                {
                  icon: <EventBusyRounded sx={{ fontSize: "1rem" }} />,
                  text: meta.date_close,
                },
                {
                  icon: <HourglassBottom sx={{ fontSize: "1rem" }} />,
                  text: `${meta.days_left} DAYS LEFT`,
                },
              ].map(({ icon, text }, index) => (
                <Typography
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    fontSize: "0.75rem",
                  }}
                >
                  {icon} {text}{" "}
                  {index < 2 && <Divider orientation="vertical" flexItem />}
                </Typography>
              ))}
            </Box>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ backgroundColor: "#E9DADD" }}>
        {meta.description}
      </AccordionDetails>

      {/* Conditional Actions */}
      {(meta.status === "Pending" ||
        meta.status === "Completed" ||
        meta.status === "Feedback" ||
        meta.status === "Closed") && (
        <AccordionActions sx={{ backgroundColor: "#E9DADD" }}>
          {meta.status === "Feedback" && feedback && (
            <Button
              variant="contained"
              onClick={() => handleDownload(feedback.src, feedback.title)}
              startIcon={<DownloadIcon />}
            >
              Feedback
            </Button>
          )}

          {meta.status === "Completed" ||
            (meta.status === "Closed" && submission && (
              <Button
                variant="contained"
                onClick={() => handleDownload(submission.src, submission.title)}
                startIcon={<DownloadIcon />}
              >
                {submission.title}
              </Button>
            ))}

          {meta.status === "Pending" &&
            (uploadedFile ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography>{uploadedFile.name}</Typography>
                <IconButton onClick={handleRemoveFile}>
                  <DeleteIcon color="error" />
                </IconButton>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<OutboxRounded />}
                >
                  Submit
                </Button>
              </Stack>
            ) : (
              <Button
                component="label"
                variant="contained"
                startIcon={<UploadIcon />}
              >
                Upload
                <VisuallyHiddenInput
                  type="file"
                  required
                  onChange={handleFileUpload}
                />
              </Button>
            ))}
        </AccordionActions>
      )}
    </Accordion>
  );
}

export default SubmissionCards;
