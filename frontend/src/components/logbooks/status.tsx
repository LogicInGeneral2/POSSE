import {
  CheckCircle,
  HourglassEmptyRounded,
  PendingRounded,
  UpdateRounded,
} from "@mui/icons-material";

export interface StatusInfo {
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
    value: "approved",
    color: "success",
    icon: <CheckCircle />,
  },
  {
    value: "sent",
    color: "primary",
    icon: <PendingRounded />,
  },
  {
    value: "feedback",
    color: "info",
    icon: <UpdateRounded />,
  },
  {
    value: "pending",
    color: "warning",
    icon: <HourglassEmptyRounded />,
  },
];

export { status_info };
