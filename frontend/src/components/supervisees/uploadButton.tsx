import { Box, Button, List, ListItem, IconButton, styled } from "@mui/material";
import { useState } from "react";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";

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
  onFilesUploaded,
  text = "Upload File",
  multiple = false, // Added prop to control multiple file selection
}: {
  size: string;
  disabled: boolean;
  variants?: "text" | "outlined" | "contained";
  icon?: boolean;
  onFilesUploaded: (files: File | File[]) => void;
  text?: string;
  multiple?: boolean; // New prop with default false
}) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      if (!multiple && filesArray.length > 1) {
        // If multiple is false, take only the first file
        setUploadedFiles([filesArray[0]]);
        onFilesUploaded(filesArray[0]); // Send single file to parent
      } else {
        setUploadedFiles(filesArray);
        onFilesUploaded(multiple ? filesArray : filesArray[0]); // Send array or single file based on multiple prop
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesUploaded(multiple ? newFiles : newFiles[0] || null); // Update parent: array or single file/null
  };

  return (
    <Box sx={{ width: { size } }}>
      <Button
        component="label"
        variant={variants}
        startIcon={icon ? <UploadIcon /> : undefined}
        sx={{ width: "100%" }}
        disabled={disabled}
      >
        {text}
        <VisuallyHiddenInput
          type="file"
          multiple={multiple} // Use the multiple prop
          required
          onChange={handleFileUpload}
        />
      </Button>

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
