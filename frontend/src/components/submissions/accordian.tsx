import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  EventAvailableRounded,
  EventBusyRounded,
  HourglassBottom,
  OutboxRounded,
} from "@mui/icons-material";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useState } from "react";
import {
  FeedbackType,
  StatusInfo,
  SubmissionsMetaType,
  SubmissionType,
} from "../../services/types";
import { deleteSubmission, uploadSubmission } from "../../services";
import { useUser } from "../../../context/UserContext";
import Download_Button from "../commons/download_button";

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
  refreshSubmissions,
  statusInfo,
}: {
  submission: SubmissionType | null;
  feedback: FeedbackType | null;
  meta: SubmissionsMetaType;
  refreshSubmissions: () => void;
  statusInfo: StatusInfo[];
}) {
  const { user } = useUser();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setUploadedFile(event.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async () => {
    if (!uploadedFile || !meta || !user) {
      console.log("Missing file or submission phase.");
      return;
    }

    try {
      const response = await uploadSubmission({
        studentId: user.id,
        file: uploadedFile,
        submissionPhaseId: meta.id,
      });

      if (response.status >= 200 && response.status < 300) {
        console.log("Upload successful!");
        refreshSubmissions();
      } else {
        const errorData = await response;
        console.error("Upload failed:", errorData);
      }
    } catch (error) {
      console.error("Error during upload:", error);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!user || !submission) {
      console.log("Missing user or submission.");
      return;
    }
    try {
      await deleteSubmission(user.id, submission.id);
      refreshSubmissions();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during delete:", error.message);
      }
    }
  };

  const status = statusInfo.find((s) => s.value === meta.status);
  const statusIcon = status?.icon || null;
  const [expanded, setExpanded] = useState(false);
  const maxPreviewLines = 2;

  return (
    <Accordion sx={{ m: 0, p: 0 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id="submissions-header"
        sx={{
          backgroundColor: "base.main",
          border: "1px solid",
          borderTopRightRadius: "8px",
          borderTopLeftRadius: "8px",
        }}
      >
        <Stack direction="row" spacing={2}>
          {statusIcon}
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
      <AccordionDetails sx={{ backgroundColor: "base.main" }}>
        {meta.description}
      </AccordionDetails>

      {/* Conditional Actions */}
      {(meta.status === "Pending" ||
        meta.status === "Completed" ||
        meta.status === "Feedback" ||
        meta.status === "Closed") && (
        <AccordionActions sx={{ backgroundColor: "base.main" }}>
          {meta.status === "Feedback" && feedback && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                m: 2,
              }}
            >
              <Box
                sx={{
                  border: "2px solid",
                  p: 2,
                  borderRadius: "8px",
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  SV's Comment:
                </Typography>
                <Collapse in={expanded} collapsedSize={maxPreviewLines * 24}>
                  <Typography
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {feedback.comment}
                  </Typography>
                </Collapse>
                <Button
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  sx={{ mt: 1 }}
                >
                  {expanded ? "Show less" : "Read more"}
                </Button>
              </Box>
              {feedback.src && (
                <Download_Button
                  fileUrl={feedback.src}
                  text={feedback.title}
                  variants="contained"
                  disabled={false}
                />
              )}
            </Box>
          )}
          {meta.status === "Closed" && submission && (
            <>
              <Download_Button
                fileUrl={submission.src}
                text={submission.title}
                variants="contained"
                disabled={false}
              />
            </>
          )}
          {meta.status === "Completed" && submission && (
            <>
              <IconButton onClick={handleDeleteSubmission}>
                <DeleteIcon color="error" />
              </IconButton>
              <Download_Button
                fileUrl={submission.src}
                text={submission.title}
                variants="contained"
                disabled={false}
              />
            </>
          )}
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
