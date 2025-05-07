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
import Toast from "../commons/snackbar";
import ConfirmationDialog from "../commons/confirmation";

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
  feedback: FeedbackType[] | null;
  meta: SubmissionsMetaType;
  refreshSubmissions: () => void;
  statusInfo: StatusInfo[];
}) {
  const { user } = useUser();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [expandedFeedbacks, setExpandedFeedbacks] = useState<boolean[]>([]);

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
      setToast({
        open: true,
        message: "Missing file, submission phase, or user information.",
        severity: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await uploadSubmission({
        studentId: user.id,
        file: uploadedFile,
        submissionPhaseId: meta.id,
      });

      if (response.status >= 200 && response.status < 300) {
        setToast({
          open: true,
          message: "Upload successful!",
          severity: "success",
        });
        setUploadedFile(null);
        setTimeout(() => {
          refreshSubmissions();
        }, 500);
      } else {
        const errorData = await response;
        setToast({
          open: true,
          message: `Upload failed: ${errorData || "Unknown error."}`,
          severity: "error",
        });
      }
    } catch (error: any) {
      setToast({
        open: true,
        message: `Error during upload: ${error.message || "Please try again."}`,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!user || !submission) {
      setToast({
        open: true,
        message: "Missing user or submission information.",
        severity: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      await deleteSubmission(user.id, submission.id);
      setToast({
        open: true,
        message: "Submission deleted successfully!",
        severity: "success",
      });
      setTimeout(() => {
        refreshSubmissions();
      }, 500);
    } catch (error: any) {
      setToast({
        open: true,
        message: `Error during delete: ${error.message || "Please try again."}`,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const toggleFeedbackExpand = (index: number) => {
    setExpandedFeedbacks((prev) => {
      const newExpanded = [...prev];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };

  const status = statusInfo.find((s) => s.value === meta.status);
  const statusIcon = status?.icon || null;
  const maxPreviewLines = 2;

  return (
    <>
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
      <ConfirmationDialog
        open={openDialog}
        title="Confirm Deletion"
        message="Are you sure you want to delete this submission? This action cannot be undone."
        onConfirm={handleDeleteSubmission}
        onCancel={handleCloseDialog}
        isLoading={isLoading}
      />
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
                    {icon} {text}
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
            {meta.status === "Feedback" && feedback && feedback.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,
                  m: 2,
                  width: "100%",
                }}
              >
                {feedback.map((singleFeedback, index) => (
                  <Box
                    key={singleFeedback.id}
                    sx={{
                      border: "2px solid",
                      p: 2,
                      borderRadius: "8px",
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Feedback from {singleFeedback.supervisorName}:
                    </Typography>
                    <Collapse
                      in={expandedFeedbacks[index] || false}
                      collapsedSize={maxPreviewLines * 24}
                    >
                      <Typography
                        sx={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {singleFeedback.comment}
                      </Typography>
                    </Collapse>
                    <Button
                      size="small"
                      onClick={() => toggleFeedbackExpand(index)}
                      sx={{ mt: 1 }}
                    >
                      {expandedFeedbacks[index] ? "Show less" : "Read more"}
                    </Button>
                    {singleFeedback.src && (
                      <Download_Button
                        fileUrl={singleFeedback.src}
                        text={singleFeedback.title}
                        variants="contained"
                        disabled={false}
                      />
                    )}
                  </Box>
                ))}
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
                <IconButton onClick={handleOpenDialog}>
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
    </>
  );
}

export default SubmissionCards;
