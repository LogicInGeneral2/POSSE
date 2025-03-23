import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import EditNoteIcon from "@mui/icons-material/EditNote";

const course_options = [
  { label: "Progress 1" },
  { label: "Progress 2" },
  { label: "Proposal" },
  { label: "Final" },
];

const status_options = [
  { label: "Reviewed" },
  { label: "Pending" },
  { label: "Behind" },
  { label: "Submitted" },
  { label: "Graded" },
];

const action_options = [
  {
    label: "View Submission",
    icon: (
      <SearchIcon
        sx={{
          color: "#F8B628",
          fontSize: "1rem",
          backgroundColor: "#58041D",
          padding: "0.25rem",
          borderRadius: "50%",
        }}
      />
    ),
    type: "navigate",
    path: "/viewing",
  },
  {
    label: "Download Submission",
    icon: (
      <DownloadIcon
        sx={{
          color: "#F8B628",
          fontSize: "1rem",
          backgroundColor: "#58041D",
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
          color: "#F8B628",
          fontSize: "1rem",
          backgroundColor: "#58041D",
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
          color: "#F8B628",
          fontSize: "1rem",
          backgroundColor: "#58041D",
          padding: "0.25rem",
          borderRadius: "50%",
        }}
      />
    ),
    type: "navigate",
    path: "/grading",
  },
];

export { course_options, status_options, action_options };
