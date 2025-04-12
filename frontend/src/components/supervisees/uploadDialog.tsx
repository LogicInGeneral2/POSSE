import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
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
import { DeleteRounded } from "@mui/icons-material";

function UploadDialog({
  setOpenDialog,
  id,
}: {
  setOpenDialog: (open: boolean) => void;
  id: number;
}) {
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionType | null>(null);
  const [submissionList, setSubmissionList] = useState<SubmissionType[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File>();
  const [isLoading, setIsloading] = useState(true);

  const fetchSubmissionList = async () => {
    setIsloading(true);
    try {
      const data = await getUserSubmissions(id);
      setSubmissionList(data.data);

      if (selectedSubmission) {
        const updated = data.data.find(
          (item: SubmissionType) => item.id === selectedSubmission.id
        );
        if (updated) setSelectedSubmission(updated);
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

  if (!submissionList) {
    return <ErrorNotice />;
  }

  const handleDeleteFeedback = async (feedbackId: number) => {
    try {
      await deleteFeedback(feedbackId);
      console.log("Feedback deleted.");
      await fetchSubmissionList();
    } catch (error) {
      console.error("Failed to delete feedback:", error);
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    const id = Number(event.target.value);
    const found = submissionList.find((item) => item.id === id);
    if (!found) return;
    setSelectedSubmission(found);
  };

  const handleFileUpload = (files: File | File[]) => {
    if (Array.isArray(files)) {
      setUploadedFile(files[0]);
    } else {
      setUploadedFile(files);
    }
  };
  const handleSubmit = async () => {
    if (!id || !uploadedFile || !selectedSubmission) {
      console.log("Missing file or submission phase.");
      return;
    }

    try {
      const response = await uploadFeedback({
        studentId: id,
        file: uploadedFile,
        submissionId: selectedSubmission.id,
      });

      if (response.status >= 200 && response.status < 300) {
        console.log("Upload successful!");
        setUploadedFile(undefined);
        await fetchSubmissionList();
      } else {
        const errorData = await response;
        console.error("Upload failed:", errorData);
      }
    } catch (error) {
      console.error("Error during upload:", error);
    }
  };

  return (
    <>
      <DialogContent>
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
                  <>
                    <Download_Button
                      icon={true}
                      disabled={!selectedSubmission.feedback.src}
                      variants="contained"
                      fileUrl={selectedSubmission.feedback?.src}
                    />
                    <IconButton
                      color="primary"
                      onClick={() =>
                        selectedSubmission?.feedback?.id !== undefined
                          ? handleDeleteFeedback(selectedSubmission.feedback.id)
                          : console.error("Feedback ID is undefined")
                      }
                    >
                      <DeleteRounded />
                    </IconButton>
                  </>
                )}
              </Box>
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
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={() => setOpenDialog(false)}>Close</Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedSubmission || !uploadedFile}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  );
}

export default UploadDialog;
