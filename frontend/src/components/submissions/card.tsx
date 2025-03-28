import { Grid2 as Grid, Typography } from "@mui/material";
import { status_info } from "./status";

function LegendCard() {
  return (
    <Grid container sx={{ display: "flex", gap: "0.5rem" }}>
      {status_info.map((file, index) => (
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
