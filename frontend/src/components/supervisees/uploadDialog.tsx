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
} from "@mui/material";
import Upload_Button from "./uploadButton";

import { useEffect, useState } from "react";
import { getUserSubmissions, uploadFeedback } from "../../services";
import ErrorNotice from "../commons/error";
import { SubmissionType } from "../../services/types";
import LoadingSpinner from "../commons/loading";

function UploadDialog({
  setOpenDialog,
}: {
  setOpenDialog: (open: boolean) => void;
}) {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    number | null
  >(null);
  const [submissionList, setSubmissionList] = useState<SubmissionType[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsloading] = useState(true);

  useEffect(() => {
    const fetchSubmissionList = async () => {
      const data = await getUserSubmissions();
      setSubmissionList(data);
      setIsloading(false);
    };
    fetchSubmissionList();
  }, []);

  if (!submissionList) {
    return <ErrorNotice />;
  }

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedSubmissionId(Number(event.target.value));
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleConfirm = async () => {
    if (!selectedSubmissionId || uploadedFiles.length === 0) return;

    try {
      const payload = {
        supervisorId: 1, // Assume supervisor ID (or get from context/state)
        submissionId: selectedSubmissionId, // The selected submission ID
        feedbackFiles: uploadedFiles.map((file) => ({
          title: file.name,
          upload_date: new Date().toISOString(),
          src: URL.createObjectURL(file), // Mock file URL
        })),
      };

      await uploadFeedback(payload);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error uploading feedback:", error);
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
              <FormControl fullWidth size="small" sx={{ mb: "20px" }}>
                <InputLabel>Submission</InputLabel>
                <Select
                  value={selectedSubmissionId?.toString() || ""}
                  onChange={handleChange}
                >
                  {submissionList.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.progress}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Upload_Button
                size="small"
                icon={false}
                variants="contained"
                disabled={!selectedSubmissionId}
                onFilesUploaded={handleFileUpload} // Pass callback to capture uploaded files
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={() => setOpenDialog(false)}>Close</Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedSubmissionId || uploadedFiles.length === 0}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  );
}

export default UploadDialog;
