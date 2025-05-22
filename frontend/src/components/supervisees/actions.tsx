import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { BookRounded, EditRounded } from "@mui/icons-material";
import { Action } from "../../services/types";

export const action_options: Action[] = [
  {
    label: "View Submission",
    icon: <SearchIcon />,
    type: "navigate",
    path: "/viewing",
  },
  {
    label: "View Logbook",
    icon: <BookRounded />,
    type: "navigate",
    path: "/logs",
  },
  {
    label: "Download Submission",
    icon: <DownloadIcon />,
    type: "dialog",
  },
  {
    label: "Upload Feedback",
    icon: <FileUploadIcon />,
    type: "dialog",
  },
  {
    label: "Grade Submission",
    icon: <EditNoteIcon />,
    type: "navigate",
    path: "/grading",
  },
  {
    label: "Edit Topic",
    icon: <EditRounded />,
    type: "dialog",
  },
];
