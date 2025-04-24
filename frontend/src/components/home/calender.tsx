import { FC, useEffect, useState, useCallback } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Event as RBCEvent,
} from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";
import { addHours } from "date-fns/addHours";
import { startOfHour } from "date-fns/startOfHour";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calender.css";
import { LogType, periodTypes } from "../../services/types";
import { getEvents, getLogsLists } from "../../services";
import { useNavigate } from "react-router";
import LoadingSpinner from "../commons/loading";
import { Paper } from "@mui/material";

interface DashboardCalenderProps {
  id: number;
  role: string;
}

interface LocalizerConfig {
  format: typeof format;
  parse: typeof parse;
  startOfWeek: typeof startOfWeek;
  getDay: typeof getDay;
  locales: { [key: string]: typeof enUS };
}

interface CustomEvent extends RBCEvent {
  tag: "period" | "log";
  details: periodTypes | LogType;
}

const DashboardCalender: FC<DashboardCalenderProps> = ({ id, role }) => {
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CustomEvent | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const eventsData: periodTypes[] = (await getEvents()).data;
        const eventItems: CustomEvent[] = eventsData.map((period) => ({
          title: period.title.toString(),
          start: new Date(period.start_date),
          end: new Date(period.end_date),
          tag: "period" as const,
          details: period,
        }));

        let allEvents: CustomEvent[] = [...eventItems];

        if (role === "student") {
          const logsData: LogType[] = (await getLogsLists(id)).data;
          const logItems: CustomEvent[] = logsData.map((log) => ({
            title: `LOG ${log.date.toString()}`,
            start: new Date(log.date),
            end: new Date(log.date),
            tag: "log" as const,
            details: log,
          }));
          allEvents = [...allEvents, ...logItems];
        }

        setEvents(allEvents);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, role]);

  const handleSelectEvent = useCallback((event: CustomEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
  };

  return (
    <Paper sx={{ height: "calc(100vh - 320px)" }}>
      <Calendar
        defaultView="month"
        events={events}
        localizer={localizer}
        onSelectEvent={handleSelectEvent}
        selectable
      />
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            {selectedEvent?.title || "No Title"}
          </Typography>
          {selectedEvent?.tag === "period" && selectedEvent?.details && (
            <>
              <Typography sx={{ mt: 2 }}>
                <strong>Description:</strong>{" "}
                {(selectedEvent.details as periodTypes).description || "N/A"}
              </Typography>
              <Typography>
                <strong>Directory:</strong>{" "}
                {(selectedEvent.details as periodTypes).directory || "N/A"}
              </Typography>
              <Typography>
                <strong>Days Left:</strong>{" "}
                {(selectedEvent.details as periodTypes).days_left ?? "N/A"}
              </Typography>
            </>
          )}
          {selectedEvent?.tag === "log" && selectedEvent?.details && (
            <>
              <Typography sx={{ mt: 2 }}>
                <strong>Activities:</strong>{" "}
                {(selectedEvent.details as LogType).activities || "N/A"}
              </Typography>
              <Typography>
                <strong>Feedbacks:</strong>{" "}
                {(selectedEvent.details as LogType).feedbacks || "N/A"}
              </Typography>
              <Typography>
                <strong>Plan:</strong>{" "}
                {(selectedEvent.details as LogType).plan || "N/A"}
              </Typography>
            </>
          )}
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            {" "}
            <Button onClick={handleCloseModal} variant="outlined">
              Close
            </Button>{" "}
            {selectedEvent?.tag === "log" && (
              <Button variant="contained" onClick={() => navigate("/logs")}>
                Details
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </Paper>
  );
};

const locales: LocalizerConfig["locales"] = {
  "en-US": enUS,
};

const endOfHour = (date: Date): Date => addHours(startOfHour(date), 1);
const now = new Date();
const start = endOfHour(now);
const end = addHours(start, 2);

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default DashboardCalender;
