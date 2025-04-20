import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { JSX } from "react";
import { BookRounded } from "@mui/icons-material";

export interface Action {
  label: string;
  icon: JSX.Element;
  type: "dialog" | "navigate";
  path?: string;
}

export const action_options = [
  {
    label: "View Submission",
    icon: (
      <SearchIcon
        sx={{
          color: "secondary.main",
          fontSize: "1rem",
          backgroundColor: "primary.main",
          padding: "0.25rem",
          borderRadius: "50%",
        }}
      />
    ),
    type: "navigate",
    path: "/viewing",
  },
  {
    label: "View Logbook",
    icon: (
      <BookRounded
        sx={{
          color: "secondary.main",
          fontSize: "1rem",
          backgroundColor: "primary.main",
          padding: "0.25rem",
          borderRadius: "50%",
        }}
      />
    ),
    type: "navigate",
    path: "/logs",
  },
  {
    label: "Download Submission",
    icon: (
      <DownloadIcon
        sx={{
          color: "secondary.main",
          fontSize: "1rem",
          backgroundColor: "primary.main",
          padding: "0.25rem",
          borderRadius: "50%",
        }}
      />
    ),
    type: "dialog",
  },
  {
    label: "Upload Feedback",
    icon: (
      <FileUploadIcon
        sx={{
          color: "secondary.main",
          fontSize: "1rem",
          backgroundColor: "primary.main",
          padding: "0.25rem",
          borderRadius: "50%",
        }}
      />
    ),
    type: "dialog",
  },
  {
    label: "Grade Submission",
    icon: (
      <EditNoteIcon
        sx={{
          color: "secondary.main",
          fontSize: "1rem",
          backgroundColor: "primary.main",
          padding: "0.25rem",
          borderRadius: "50%",
        }}
      />
    ),
    type: "navigate",
    path: "/grading",
  },
];
