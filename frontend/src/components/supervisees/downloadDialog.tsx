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
import { useEffect, useState } from "react";
import Download_Button from "../commons/download_button";
import { getUserSubmissions } from "../../services";
import ErrorNotice from "../commons/error";
import { SubmissionType } from "../../services/types";
import LoadingSpinner from "../commons/loading";

function DownloadDialog({
  setOpenDialog,
}: {
  setOpenDialog: (open: boolean) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [submissionList, setSubmissionList] = useState<SubmissionType[]>([]);
  const [isLoading, setIsloading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<string | "">("");

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
    const fileId = event.target.value;
    setSelectedFileId(fileId);
    const file = submissionList.find((item) => item.id === Number(fileId));
    setSelectedFile(file ? file.src : null);
  };

  return (
    <>
      <DialogContent>
        <Box sx={{ display: "block", p: "5px" }}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <FormControl fullWidth size="small">
              <InputLabel>Submission</InputLabel>
              <Select value={selectedFileId} onChange={handleChange}>
                {submissionList.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {item.progress}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={() => setOpenDialog(false)}>Close</Button>
        <Download_Button
          fileUrl={selectedFile}
          text="Download"
          disabled={!selectedFile}
          variants="text"
          icon={false}
        />
      </DialogActions>
    </>
  );
}

export default DownloadDialog;
