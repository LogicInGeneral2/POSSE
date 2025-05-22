import { Box, Typography } from "@mui/material";
import { Action, StatusInfo } from "../../services/types";

interface LegendCardProps {
  statusInfo: (StatusInfo | Action)[];
}

function LegendCard({ statusInfo }: LegendCardProps) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
      {statusInfo.map((item, index) => {
        const isStatusInfo = "value" in item && "color" in item;
        const legend = isStatusInfo
          ? (item as StatusInfo).legend
          : (item as Action).icon;
        const value = isStatusInfo
          ? (item as StatusInfo).value
          : (item as Action).label;

        return (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              minWidth: "fit-content",
            }}
          >
            {legend}
            <Typography sx={{ display: "flex", alignItems: "center" }}>
              {value}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default LegendCard;
