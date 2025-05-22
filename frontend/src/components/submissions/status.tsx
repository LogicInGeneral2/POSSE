import {
  CheckCircle,
  ErrorRounded,
  LockRounded,
  PendingRounded,
  WarningAmber,
} from "@mui/icons-material";
import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { StatusIcon, StatusInfo, SubmissionTheme } from "../../services/types";

const createStatusIcon = (
  IconComponent: OverridableComponent<SvgIconTypeMap>,
  iconColor: string,
  bgColor: string,
  isLegend: boolean = false
): StatusIcon => ({
  icon: (
    <IconComponent
      sx={{
        color: iconColor,
        fontSize: isLegend ? "1rem" : "1.5rem",
        backgroundColor: bgColor,
        ...(isLegend
          ? { padding: "0.5rem", borderRadius: "50%" }
          : {
              height: "3.25rem",
              width: "2rem",
              padding: "0.25rem",
              borderRight: "1px solid primary.main",
              borderTopLeftRadius: "8px",
              borderBottomLeftRadius: "8px",
            }),
      }}
    />
  ),
});

const defaultStatusConfig: Array<{
  value: string;
  icon: OverridableComponent<SvgIconTypeMap>;
  fallbackColor: string;
  fallbackIconColor: string;
}> = [
  {
    value: "Pending",
    icon: ErrorRounded,
    fallbackColor: "#ffda07",
    fallbackIconColor: "#554902",
  },
  {
    value: "Upcoming",
    icon: PendingRounded,
    fallbackColor: "#17a2b8",
    fallbackIconColor: "#020c0e",
  },
  {
    value: "Completed",
    icon: CheckCircle,
    fallbackColor: "#28a745",
    fallbackIconColor: "#3cfc68",
  },
  {
    value: "Closed",
    icon: LockRounded,
    fallbackColor: "#6c757d",
    fallbackIconColor: "#1f1f1f",
  },
  {
    value: "Feedback",
    icon: ErrorRounded,
    fallbackColor: "#0d6efd",
    fallbackIconColor: "#042453",
  },
  {
    value: "Missed",
    icon: WarningAmber,
    fallbackColor: "#dc3545",
    fallbackIconColor: "#320c10",
  },
];

export const getStatusInfo = (themes: SubmissionTheme[]): StatusInfo[] => {
  return defaultStatusConfig.map(
    ({ value, icon, fallbackColor, fallbackIconColor }) => {
      const theme = themes.find((t) => t.label === value);
      const color = theme?.primary ?? fallbackColor;
      const iconColor = theme?.secondary ?? fallbackIconColor;

      return {
        value,
        color,
        ...createStatusIcon(icon, iconColor, color),
        legend: createStatusIcon(icon, iconColor, color, true).icon,
      };
    }
  );
};
