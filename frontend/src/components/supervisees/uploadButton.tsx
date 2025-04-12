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
  text = "Upload Files",
}: {
  size: string;
  disabled: boolean;
  variants?: "text" | "outlined" | "contained";
  icon?: boolean;
  onFilesUploaded: (files: File | File[]) => void;
  text?: string;
}) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setUploadedFiles([...uploadedFiles, ...filesArray]);
      onFilesUploaded([...uploadedFiles, ...filesArray]); // Send files back to parent
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles); // Update parent state
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
          multiple
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
