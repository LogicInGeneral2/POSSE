import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import { LogType } from "../../services/types";
import { status_info } from "./status";

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

      {data.map((row, index) => {
        const statusDetail: StatusInfo = status_info.find(
          (info) => info.value === row.status
        ) || {
          value: "Unknown",
          color: "default",
          icon: <></>, // Fallback to empty fragment
        };

        return (
          <Card
            key={row.id}
            sx={{
              my: 1,
              overflow: "auto",
              cursor: "pointer",
              transition: "0.3s",
              backgroundColor: "primary.main",
              "&:hover": {
                boxShadow: 3,
                bgcolor: "secondary.main",
                "& *": {
                  color: "primary.main",
                },
              },
            }}
            onClick={() => onRowClick(row)}
          >
            <CardContent>
              <Grid container spacing={2} textAlign="center">
                <Grid size={2}>
                  <Typography variant="body1" color="secondary">
                    {index + 1}
                  </Typography>
                </Grid>
                <Grid size={5}>
                  <Typography variant="body1" color="secondary">
                    {row.date}
                  </Typography>
                </Grid>
                <Grid size={5}>
                  <Chip
                    label={row.status}
                    icon={statusDetail.icon}
                    variant="outlined"
                    size="small"
                    color={statusDetail.color}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
