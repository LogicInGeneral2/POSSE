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
import Upload_Button from "../commons/upload_button";
import data from "../../../data/submissions.json";

import { useState } from "react";

function UploadDialog({
  setOpenDialog,
}: {
  setOpenDialog: (open: boolean) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleChange = (event: SelectChangeEvent) => {
    const fileId = event.target.value;
    const file = data.find((item) => item.id === Number(fileId));
    setSelectedFile(file ? file.submission_file : null);
  };
  return (
    <>
      <DialogContent>
        <Box sx={{ display: "block", p: "5px" }}>
          <FormControl fullWidth size="small" sx={{ mb: "20px" }}>
            <InputLabel>Submission</InputLabel>
            <Select value={selectedFile || ""} onChange={handleChange}>
              {data.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Upload_Button
            size="small"
            icon={false}
            variants="contained"
            disabled={!selectedFile}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={() => setOpenDialog(false)}>Close</Button>
        <Button>Confirm</Button>
      </DialogActions>
    </>
  );
}

export default UploadDialog;
