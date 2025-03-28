import { CheckCircle, PendingRounded } from "@mui/icons-material";

interface StatusInfo {
  value: string;
  color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
  icon: React.ReactElement;
}

const status_info: StatusInfo[] = [
  {
    value: "Approved",
    color: "success",
    icon: <CheckCircle />,
  },
  {
    value: "Sent",
    color: "info",
    icon: <PendingRounded />,
  },
];

export { status_info };
