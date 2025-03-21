import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  ErrorRounded,
  EventAvailableRounded,
  EventBusyRounded,
  HourglassBottom,
  OutboxRounded,
} from "@mui/icons-material";
import { status_info } from "../../modals/submissions";
import SubmissionsType from "./submissionsType";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import React, { useState } from "react";

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

function SubmissionCards({ file }: { file: SubmissionsType }) {
  const themes = status_info.find((color) => color.value === file.status) || {
    color: "#ffffff",
    icon: (
      <ErrorRounded
        sx={{
          mr: 1,
          fontSize: "1.5rem",
          backgroundColor: "#ffda07",
          height: "3.25rem",
          width: "2rem",
          padding: "0.25rem",
          borderRight: "1px solid",
          borderTopLeftRadius: "8px",
        }}
      />
    ),
  };

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(event.target.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.feedback_file;
    link.download = file.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = () => {
    console.log("Submitting uploaded files:", uploadedFiles);
  };

  return (
    <Accordion sx={{ m: 0, p: 0 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id="submissions-header"
        sx={{
          backgroundColor: "#E9DADD",
          border: "1px solid",
          borderTopRightRadius: "8px",
          borderTopLeftRadius: "8px",
        }}
      >
        <Stack direction="row" spacing={2}>
          {themes.icon}
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
              {file.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {[
                {
                  icon: <EventAvailableRounded sx={{ fontSize: "1rem" }} />,
                  text: file.date_open,
                },
                {
                  icon: <EventBusyRounded sx={{ fontSize: "1rem" }} />,
                  text: file.date_close,
                },
                {
                  icon: <HourglassBottom sx={{ fontSize: "1rem" }} />,
                  text: `${file.days_left} DAYS LEFT`,
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
                  {icon} {text}{" "}
                  {index < 2 && <Divider orientation="vertical" flexItem />}
                </Typography>
              ))}
            </Box>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ backgroundColor: "#E9DADD" }}>
        {file.description}
      </AccordionDetails>
      <AccordionActions sx={{ backgroundColor: "#E9DADD" }}>
        {file.status == "Feedback" && (
          <Button
            variant="outlined"
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
          >
            Feedback
          </Button>
        )}

        {uploadedFiles.length > 0 && (
          <List>
            {uploadedFiles.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                }
              >
                {file.name}
              </ListItem>
            ))}
          </List>
        )}
        {file.status !== "Completed" &&
          file.status !== "Feedback" &&
          (uploadedFiles.length > 0 ? (
            <Button
              variant="outlined"
              onClick={handleSubmit}
              startIcon={<OutboxRounded />}
            >
              Submit
            </Button>
          ) : (
            <Button
              component="label"
              variant="outlined"
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
    </Accordion>
  );
}

export default SubmissionCards;
