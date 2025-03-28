import { Box, Divider, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { LogType } from "../../services/types";
import { getLogbookList } from "../../services";
import ErrorNotice from "../commons/error";
import DataTable from "./table";
import Details from "./details";
import { useUser } from "../../../context/UserContext";
import Calendar from "./calendar";
import { format } from "date-fns";
import Breadcrumb from "../commons/breadcrumbs";
import { useLocation, useSearchParams } from "react-router";
import LoadingSpinner from "../commons/loading";

export const LogbooksPage = () => {
  const { user } = useUser();
  const [data, setData] = useState<LogType[]>([]);
  const [logDates, setLogDates] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("supervisor");

  if (user !== null && user.role !== "student") {
    useEffect(() => {
      const stateData = location.state?.rowData?.student || {};
      setStudentName(searchParams.get("name") || stateData.name);
      setStudentId(searchParams.get("student") || stateData.id);
      setCategory(location.state?.category || "supervisor");
    }, [location.state, searchParams, user.role]);
  }

  useEffect(() => {
    const fetchLogs = async () => {
      const idToFetch = user?.role === "supervisor" ? studentId : user?.id;

      if (!idToFetch) return;

      try {
        const fetchedData = await getLogbookList(idToFetch as number);
        setData(fetchedData);
        setLogDates(fetchedData.map((log: { date: any }) => log.date));
      } catch (error) {
        console.error("Failed to fetch logs", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [user, studentId]);

  const handleSelectLog = (log: LogType) => {
    setSelectedLog(log);
    setSelectedDate(log.date);
  };

  const handleSave = (updatedLog: LogType) => {
    setData((prevData) =>
      prevData.some((log) => log.id === updatedLog.id)
        ? prevData.map((log) => (log.id === updatedLog.id ? updatedLog : log))
        : [...prevData, updatedLog]
    );

    setSelectedLog(updatedLog);

    setLogDates((prevDates) => {
      // Remove the old date if it exists
      const oldDate = selectedLog?.date;
      const newDates = prevDates.filter((date) => date !== oldDate);

      // Add the updated date
      return [...new Set([...newDates, updatedLog.date])];
    });
  };

  const handleDelete = (id: number) => {
    setData((prevData) => {
      const updatedData = prevData.filter((log) => log.id !== id);
      setLogDates(updatedData.map((log) => log.date));
      return updatedData;
    });
    setSelectedLog(null);
  };

  const handleDateClick = (selectedDate: Date) => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    setSelectedDate(formattedDate);
    const existingLog = data.find((log) => log.date === formattedDate);

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
        status: "Draft",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <ErrorNotice />;
  }

  return (
    <div style={{ height: "100%" }}>
      <Typography fontSize="3rem" color="secondary" sx={{ fontWeight: "bold" }}>
        Log Books
      </Typography>
      {user.role !== "student" ? (
        <Box sx={{ justifyContent: "space-between", display: "flex" }}>
          <Breadcrumb
            receivedName={studentName ?? ""}
            category={category}
            currentPage="Grading"
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
            backgroundColor: "#E9DADD",
          }}
        >
          <Calendar
            logDates={logDates}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
          <DataTable data={data} onRowClick={handleSelectLog} />
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
    </div>
  );
};
