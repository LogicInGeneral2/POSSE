import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid2 as Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { LogType } from "../../services/types";
import { status_info, StatusInfo } from "./status";
import GetAppIcon from "@mui/icons-material/GetApp";
import { useState } from "react";
import { exportLogs } from "../../services";
import { format } from "date-fns";
import Toast from "../commons/snackbar";
export default function DataTable({
  data,
  studentId,
  onRowClick,
}: {
  data: LogType[];
  studentId: number;
  onRowClick: (log: LogType) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const handleExport = async () => {
    setIsLoading(true);
    try {
      await exportLogs(studentId);
    } catch (error: any) {
      setToast({
        open: true,
        message: error.message || "Failed to send feedback.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };
  return (
    <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
        }}
      >
        {" "}
        <Typography sx={{ fontWeight: "bold", textAlign: "Left" }}>
          Current Logs
        </Typography>
        <Tooltip title="Export Approved Logs" placement="top">
          <IconButton
            aria-label="Export"
            onClick={handleExport}
            disabled={isLoading}
            color="primary"
          >
            <GetAppIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {data.length === 0 && (
        <Typography sx={{ fontWeight: "bold", textAlign: "center", mt: 2 }}>
          No data available.
        </Typography>
      )}

      {data.map((row, index) => {
        const statusDetail: StatusInfo = status_info.find(
          (info) => info.value === row.status
        ) || {
          value: "N/A",
          color: "default",
          icon: <></>,
        };

        return (
          <Card
            key={row.id}
            sx={{
              my: 1,
              overflow: "auto",
              cursor: "pointer",
              transition: "0.3s",
              border: "1px solid",
              backgroundColor: "transparent",
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
                  <Typography variant="body1" color="primary">
                    {index + 1}
                  </Typography>
                </Grid>
                <Grid size={5}>
                  <Typography variant="body1" color="primary">
                    {format(row.date, "dd-MM-yyyy")}
                  </Typography>
                </Grid>
                <Grid size={5}>
                  <Chip
                    label={row.status.toUpperCase()}
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
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </Box>
  );
}
