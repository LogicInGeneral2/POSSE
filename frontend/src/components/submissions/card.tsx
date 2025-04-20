import { Grid2 as Grid, Typography } from "@mui/material";
import { StatusInfo } from "../../services/types";

function LegendCard({ statusInfo }: { statusInfo: StatusInfo[] }) {
  return (
    <Grid container sx={{ display: "flex", gap: "0.5rem" }}>
      {statusInfo.map((file, index) => (
        <Grid size={1} key={index} sx={{ display: "flex", gap: "0.5rem" }}>
          {file.legend}
          <Typography sx={{ display: "flex", alignItems: "center" }}>
            {file.value}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
}

export default LegendCard;
