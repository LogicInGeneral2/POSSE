import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import Upload_Button from "./uploadButton";
import { useEffect, useState } from "react";
import {
  deleteFeedback,
  getUserSubmissions,
  uploadFeedback,
} from "../../services";
import ErrorNotice from "../commons/error";
import { SubmissionType } from "../../services/types";
import LoadingSpinner from "../commons/loading";
import Download_Button from "../commons/download_button";
import Toast from "../commons/snackbar";
import ConfirmationDialog from "../commons/confirmation";

function UploadDialog({
  setOpenDialog,
  onRefresh,
  id,
}: {
  setOpenDialog: (open: boolean) => void;
  id: number;
  onRefresh?: () => void;
}) {
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionType | null>(null);
  const [submissionList, setSubmissionList] = useState<SubmissionType[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File>();
  const [isLoading, setIsloading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const fetchSubmissionList = async () => {
    setIsloading(true);
    try {
      const data = await getUserSubmissions(id);
      console.log(data.data);
      setSubmissionList(data.data);

      if (selectedSubmission) {
        const updated = data.data.find(
          (item: SubmissionType) => item.id === selectedSubmission.id
        );
        if (updated) {
          setSelectedSubmission(updated);
          setComment(updated.feedback?.comment || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionList();
  }, []);

  if (!submissionList) {
    return <ErrorNotice />;
  }

  const handleDelete = () => {
    setConfirmDialog({ open: true, isLoading: false });
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      await deleteFeedback(feedbackId);
      console.log("Feedback deleted.");
      setComment("");
      await fetchSubmissionList();
      setToast({
        open: true,
        message: "Feedback deleted successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to delete feedback:", error);
      setToast({
        open: true,
        message: "Failed to delete feedback.",
        severity: "error",
      });
    } finally {
      setConfirmDialog({ open: false, isLoading: false });
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    const id = Number(event.target.value);
    const found = submissionList.find((item) => item.id === id);
    if (!found) return;
    setSelectedSubmission(found);
    setComment(found.feedback?.comment || "");
  };

  const handleFileUpload = (files: File | File[]) => {
    if (Array.isArray(files)) {
      setUploadedFile(files[0]);
    } else {
      setUploadedFile(files);
    }
  };

  const handleSubmit = async () => {
    if (!id || !selectedSubmission) {
      setToast({
        open: true,
        message: "Missing file or submission phase.",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await uploadFeedback({
        studentId: id,
        file: uploadedFile ?? undefined,
        submissionId: selectedSubmission.id,
        comment: comment,
      });

      if (response.status >= 200 && response.status < 300) {
        console.log("Upload successful!");
        setUploadedFile(undefined);
        await fetchSubmissionList();
        setToast({
          open: true,
          message: "Upload successful!.",
          severity: "success",
        });
      } else {
        const errorData = await response;
        console.error("Upload failed:", errorData);
        setToast({
          open: true,
          message: errorData.data || "Upload failed.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error during upload:", error);
      setToast({
        open: true,
        message: "Error during upload.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false); // stop loading
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, isLoading: false });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handleClose = () => {
    setOpenDialog(false);
    if (!onRefresh) return;
    onRefresh();
  };

  return (
    <>
      <DialogContent
        sx={{
          pointerEvents: isSubmitting ? "none" : "auto",
          opacity: isSubmitting ? 0.5 : 1,
        }}
      >
        <Box sx={{ display: "block", p: "5px" }}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  mb: 2,
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  alignContent: "center",
                  height: "100%",
                }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel>Submission</InputLabel>
                  <Select
                    value={selectedSubmission?.id?.toString() || ""}
                    onChange={handleChange}
                  >
                    {submissionList.map((item) => (
                      <MenuItem key={item.id} value={item.id.toString()}>
                        {item.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedSubmission && selectedSubmission?.feedback?.id && (
                  <Download_Button
                    icon={true}
                    disabled={!selectedSubmission.feedback.src}
                    variants="contained"
                    fileUrl={selectedSubmission.feedback?.src}
                  />
                )}
              </Box>
              <TextField
                label="Comments"
                multiline
                maxRows={4}
                fullWidth
                size="small"
                required
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                sx={{ mb: 2 }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignContent: "top",
                  alignItems: "flex-start",
                }}
              >
                <Upload_Button
                  size="small"
                  icon={false}
                  variants="contained"
                  disabled={!selectedSubmission}
                  onFilesUploaded={handleFileUpload}
                  text={
                    selectedSubmission?.feedback?.id
                      ? "Replace File"
                      : "Upload File"
                  }
                />
                {selectedSubmission?.feedback?.id && (
                  <>
                    <Button
                      onClick={() =>
                        selectedSubmission?.feedback?.id !== undefined
                          ? handleDelete()
                          : console.error("Feedback ID is undefined")
                      }
                      variant="contained"
                      color="error"
                    >
                      DELETE FEEDBACK
                    </Button>
                    <ConfirmationDialog
                      open={confirmDialog.open}
                      title="Delete Feedback"
                      message="Are you sure you want to delete this feedback? This action cannot be undone."
                      onConfirm={() =>
                        selectedSubmission.feedback &&
                        handleDeleteFeedback(selectedSubmission.feedback.id)
                      }
                      onCancel={handleCancelDelete}
                      isLoading={confirmDialog.isLoading}
                    />
                  </>
                )}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Close
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedSubmission || !comment || isSubmitting}
        >
          {isSubmitting ? <LoadingSpinner /> : "Confirm"}
        </Button>
      </DialogActions>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </>
  );
}

export default UploadDialog;
