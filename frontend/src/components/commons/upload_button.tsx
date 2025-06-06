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

function Upload_Button({
  size,
  disabled,
  variants = "outlined",
  icon = true,
  onUpload,
}: {
  size: string;
  disabled: boolean;
  variants?: "text" | "outlined" | "contained";
  icon?: boolean;
  onUpload?: (files: File[]) => void;
}) {
  // State to track uploaded files (keeps files when toggling Edit/Save)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Handle file selection
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);

      if (onUpload) {
        onUpload(newFiles);
      }
    }
  };

  // Remove file from list
  const handleRemoveFile = (index: number) => {
    const updated = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updated);
    if (onUpload) {
      onUpload(updated);
    }
  };

  return (
    <Box sx={{ width: { size } }}>
      {/* File Upload Button */}
      <Button
        component="label"
        variant={variants}
        startIcon={icon ? <UploadIcon /> : undefined}
        sx={{ width: "100%" }}
        disabled={disabled}
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
