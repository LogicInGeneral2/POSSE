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
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calender.css";
import { LogType, periodTypes } from "../../services/types";
import { getEvents, getLogsLists } from "../../services";
import LoadingSpinner from "../commons/loading";
import { Paper } from "@mui/material";
import EventModal from "./EventModal";

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
            title: `LOG ${format(log.date, "dd-MM-yyyy")}`,
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

  return (
    <Paper sx={{ height: "calc(100vh - 320px)" }}>
      <Calendar
        defaultView="month"
        events={events}
        localizer={localizer}
        onSelectEvent={handleSelectEvent}
        selectable
      />

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          open={modalOpen}
          onClose={handleCloseModal}
          selectedEvent={selectedEvent}
        />
      )}
    </Paper>
  );
};

const locales: LocalizerConfig["locales"] = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default DashboardCalender;
