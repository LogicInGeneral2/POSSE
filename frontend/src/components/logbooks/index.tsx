import { Box, Divider, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { LogType } from "../../services/types";
import { deleteLogbook, getLogbookList, saveLogbook } from "../../services";
import ErrorNotice from "../commons/error";
import DataTable from "./table";
import Details from "./details";
import { useUser } from "../../../context/UserContext";
import Calendar from "./calendar";
import { format } from "date-fns";
import Breadcrumb from "../commons/breadcrumbs";
import { useLocation, useSearchParams } from "react-router";
import LoadingSpinner from "../commons/loading";
import Toast from "../commons/snackbar";

export const LogbooksPage = () => {
  const { user } = useUser();
  const [logData, setlogData] = useState<LogType[]>([]);
  const [logDates, setLogDates] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const category = searchParams.get("category") || location.state?.category;
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    if (user !== null && user.role !== "student") {
      const stateData = location.state?.rowData?.student || {};
      setStudentName(searchParams.get("name") || stateData.name);
      setStudentId(searchParams.get("student") || stateData.id);
    }
  }, [location.state, searchParams, user]);

  const idToFetch = useMemo(() => {
    if (!user) return null;
    if (user.role === "supervisor") return studentId ? Number(studentId) : null;
    if (user.role === "student") return user.id;
    return null;
  }, [user, studentId]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!idToFetch) return;

      try {
        const fetchedData = await getLogbookList(idToFetch);
        setlogData(fetchedData.data);
        setLogDates(fetchedData.data.map((log: { date: any }) => log.date));
      } catch (error) {
        console.error("Failed to fetch logs", error);
        setlogData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [idToFetch]);

  const handleSelectLog = (log: LogType) => {
    setSelectedLog(log);
    setSelectedDate(log.date);
  };

  const handleSave = async (updatedLog: LogType) => {
    try {
      const isUpdate = logData.some((log) => log.id === updatedLog.id);
      const payload = {
        id: isUpdate ? updatedLog.id : undefined,
        date: updatedLog.date,
        activities: updatedLog.activities || "",
        feedbacks: updatedLog.feedbacks || "",
        plan: updatedLog.plan || "",
        comment: updatedLog.comment || "",
        status: updatedLog.status || "sent",
        ...(user?.role !== "student" && {
          studentId: updatedLog.student_id ?? studentId,
          supervisorId: updatedLog.supervisor_id || user?.id,
        }),
      };

      const result = await saveLogbook(payload);

      setlogData((prevData) =>
        isUpdate
          ? prevData.map((log) =>
              log.id === result.data.id ? result.data : log
            )
          : [...prevData, result.data]
      );

      setLogDates((prevDates) => {
        const oldDate = logData.find((log) => log.id === updatedLog.id)?.date;
        const newDates = oldDate
          ? prevDates.filter((date) => date !== oldDate)
          : prevDates;
        return [...new Set([...newDates, result.data.date])];
      });

      setSelectedLog(result.data);
      setSelectedDate(result.data.date);
      setToast({
        open: true,
        message: "Log successfully updated",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error saving log:", error);
      setToast({
        open: true,
        message:
          error.detail ||
          (error.errors
            ? JSON.stringify(error.errors)
            : "Failed to save logbook."),
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteLogbook(id);
      setlogData((prevData) => {
        const updatedData = prevData.filter((log) => log.id !== id);
        setLogDates(updatedData.map((log) => log.date));
        return updatedData;
      });
      setSelectedLog(null);
      setSelectedDate(null);
      setToast({
        open: true,
        message: "Log deleted successfully",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error deleting log:", error);
      setToast({
        open: true,
        message: error.detail || "Failed to delete log",
        severity: "error",
      });
    }
  };

  const handleDateClick = (selectedDate: Date) => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    setSelectedDate(formattedDate);
    const existingLog = logData.find((log) => log.date === formattedDate);

    if (existingLog) {
      setSelectedLog(existingLog);
    } else if (user) {
      setSelectedLog({
        id: Date.now(),
        student_id: user.id,
        supervisor_id: 0,
        date: formattedDate,
        activities: "",
        feedbacks: "",
        plan: "",
        status: "pending",
        comment: "",
      });
    }
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <ErrorNotice />;
  }

  return (
    <div style={{ height: "100%" }}>
      <Typography fontSize="3rem" color="primary" sx={{ fontWeight: "bold" }}>
        Log Books
      </Typography>
      {user.role !== "student" ? (
        <Box sx={{ justifyContent: "space-between", display: "flex" }}>
          <Breadcrumb
            receivedName={studentName!}
            category={category || "supervisor"}
            currentPage="Logs"
          />
        </Box>
      ) : null}
      <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
      <Box
        sx={{
          height: "100%",
          mt: "20px",
          display: "flex",
          borderTop: "20px",
          gap: "20px",
        }}
      >
        <Box
          sx={{
            border: "1px solid",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "25%",
            backgroundColor: "base.main",
          }}
        >
          <Calendar
            logDates={logDates}
            logStatus={logData.map((log) => log.status)}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
          <DataTable
            data={logData}
            onRowClick={handleSelectLog}
            studentId={idToFetch ?? 0}
            role={user.role}
          />
        </Box>
        <Box
          sx={{
            border: "1px solid",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flexGrow: 1,
          }}
        >
          <Details
            selectedLog={selectedLog}
            onSave={handleSave}
            onDelete={handleDelete}
            userRole={user?.role as string}
          />
        </Box>
      </Box>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </div>
  );
};
