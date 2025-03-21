import { Box, Button, IconButton, List, ListItem, styled } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";

const VisuallyHiddenInput = styled("input")(() => ({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
})) as React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>;

function Upload_Button({ size }: { size: string }) {
  // State to track uploaded files (keeps files when toggling Edit/Save)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Handle file selection
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(event.target.files)]);
    }
  };

  // Remove file from list
  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  return (
    <Box sx={{ width: "100%" }}>
      {/* File Upload Button */}
      <Button
        component="label"
        variant="outlined"
        startIcon={<UploadIcon />}
        sx={{ width: { size } }}
      >
        Upload
        <VisuallyHiddenInput
          type="file"
          multiple
          required
          onChange={handleFileUpload}
        />
      </Button>

      {/* Display List of Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <List>
          {uploadedFiles.map((file, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                  <DeleteIcon color="error" />
                </IconButton>
              }
            >
              {file.name}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default Upload_Button;
