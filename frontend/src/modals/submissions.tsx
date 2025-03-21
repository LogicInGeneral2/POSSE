import {
  CheckCircle,
  ErrorRounded,
  PendingRounded,
  WarningAmber,
} from "@mui/icons-material";

const status_info = [
  {
    value: "Pending",
    color: "#ffda07",
    icon: (
      <ErrorRounded
        sx={{
          color: "#554902",
          mr: 1,
          fontSize: "1.5rem",
          backgroundColor: "#ffda07",
          height: "3.25rem",
          width: "2rem",
          padding: "0.25rem",
          borderRight: "1px solid #58041D",
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
        }}
      />
    ),
    legend: (
      <ErrorRounded
        sx={{
          color: "#554902",
          fontSize: "1rem",
          backgroundColor: "#ffda07",
          padding: "0.5rem",
          borderRadius: "50%",
        }}
      />
    ),
  },
  {
    value: "Upcoming",
    color: "#17a2b8",
    icon: (
      <PendingRounded
        sx={{
          color: "#020c0e",
          mr: 1,
          fontSize: "1.5rem",
          backgroundColor: "#17a2b8",
          height: "3.25rem",
          width: "2rem",
          padding: "0.25rem",
          borderRight: "1px solid #58041D",
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
        }}
      />
    ),
    legend: (
      <PendingRounded
        sx={{
          color: "#020c0e",
          fontSize: "1rem",
          backgroundColor: "#17a2b8",
          padding: "0.5rem",
          borderRadius: "50%",
        }}
      />
    ),
  },
  {
    value: "Completed",
    color: "#28a745",
    icon: (
      <CheckCircle
        sx={{
          color: "#3cfc68",
          mr: 1,
          fontSize: "1.5rem",
          backgroundColor: "#28a745",
          height: "3.25rem",
          width: "2rem",
          padding: "0.25rem",
          borderRight: "1px solid #58041D",
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
        }}
      />
    ),
    legend: (
      <CheckCircle
        sx={{
          color: "#3cfc68",
          fontSize: "1rem",
          backgroundColor: "#28a745",
          padding: "0.5rem",
          borderRadius: "50%",
        }}
      />
    ),
  },
  {
    value: "Feedback",
    color: "#0d6efd",
    icon: (
      <ErrorRounded
        sx={{
          color: "#042453",
          mr: 1,
          fontSize: "1.5rem",
          backgroundColor: "#0d6efd",
          height: "3.25rem",
          width: "2rem",
          padding: "0.25rem",
          borderRight: "1px solid #58041D",
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
        }}
      />
    ),
    legend: (
      <ErrorRounded
        sx={{
          color: "#042453",
          fontSize: "1rem",
          backgroundColor: "#0d6efd",
          padding: "0.5rem",
          borderRadius: "50%",
        }}
      />
    ),
  },
  {
    value: "Missed",
    color: "#dc3545",
    icon: (
      <WarningAmber
        sx={{
          color: "#320c10",
          mr: 1,
          fontSize: "1.5rem",
          backgroundColor: "#dc3545",
          height: "3.25rem",
          width: "2rem",
          padding: "0.25rem",
          borderRight: "1px solid #58041D",
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
        }}
      />
    ),
    legend: (
      <WarningAmber
        sx={{
          color: "#320c10",
          fontSize: "1rem",
          backgroundColor: "#dc3545",
          padding: "0.5rem",
          borderRadius: "50%",
        }}
      />
    ),
  },
];

export { status_info };
