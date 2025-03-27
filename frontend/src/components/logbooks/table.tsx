import {
  Box,
  Card,
  CardContent,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import { LogType } from "../../services/types";

export default function DataTable({
  data,
  onRowClick,
}: {
  data: LogType[];
  onRowClick: (log: LogType) => void;
}) {
  return (
    <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
      <Typography sx={{ fontWeight: "bold", textAlign: "Left" }}>
        Current Logs
      </Typography>

      {data.map((row, index) => (
        <Card
          key={row.id}
          sx={{
            my: 1,
            overflow: "auto",
            cursor: "pointer",
            transition: "0.3s",
            "&:hover": {
              boxShadow: 3,
              bgcolor: "primary.main",
              "& *": {
                color: "secondary.main",
              },
            },
          }}
          onClick={() => onRowClick(row)}
        >
          <CardContent>
            <Grid container spacing={2} textAlign="center">
              <Grid size={2}>
                <Typography variant="body1">{index + 1}</Typography>
              </Grid>
              <Grid size={5}>
                <Typography variant="body1">{row.date}</Typography>
              </Grid>
              <Grid size={5}>
                <Typography variant="body1">{row.status}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
