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

export const LogbooksPage = () => {
  const { user } = useUser();
  const [data, setData] = useState<LogType[]>([]);
  const [logDates, setLogDates] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) {
        console.error("User is not available");
        return;
      }
      try {
        const fetchedData = await getLogbookList(user.id);
        setData(fetchedData);
        setLogDates(fetchedData.map((log: { date: any }) => log.date));
      } catch (error) {
        console.error("Error fetching logbooks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [user]);

  const handleSelectLog = (log: LogType) => {
    setSelectedLog(log);
    setSelectedDate(log.date); // Update selected date for the calendar
  };

  const handleSave = (updatedLog: LogType) => {
    setData(
      (prevData) =>
        prevData.some((log) => log.id === updatedLog.id)
          ? prevData.map((log) => (log.id === updatedLog.id ? updatedLog : log))
          : [...prevData, updatedLog] // Add if it's a new entry
    );
    setSelectedLog(updatedLog);
    setLogDates((prev) => [...new Set([...prev, updatedLog.date])]); // Update calendar marks
  };

  const handleDelete = (id: number) => {
    setData((prevData) => prevData.filter((log) => log.id !== id));
    setSelectedLog(null);
    setLogDates((prev) =>
      prev.filter(
        (date) => !data.find((log) => log.id !== id && log.date === date)
      )
    );
  };

  const handleDateClick = (selectedDate: Date) => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    setSelectedDate(formattedDate); // Sync calendar selection
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

  if (!data) {
    return <ErrorNotice />;
  }

  return (
    <div style={{ height: "100%" }}>
      <Typography fontSize="3rem" color="secondary" sx={{ fontWeight: "bold" }}>
        Log Books
      </Typography>
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
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <Box
              sx={{
                border: "1px solid",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "25%",
                gap: "20px",
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
              />
            </Box>
          </>
        )}
      </Box>
    </div>
  );
};
