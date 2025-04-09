import { FC, useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import withDragAndDrop, {
  withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";
import { addHours } from "date-fns/addHours";
import { startOfHour } from "date-fns/startOfHour";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calender.css";
import { getEvents } from "../../services";
import { periodTypes } from "../../services/types";

const DashboardCalender: FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data: periodTypes[] = (await getEvents()).data;
        const newEvents: Event[] = data.map((period) => ({
          title: period.title,
          start: new Date(period.start_date),
          end: new Date(period.end_date),
        }));
        setEvents(newEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const onEventResize: withDragAndDropProps["onEventResize"] = (data) => {
    const { start, end } = data;

    setEvents((currentEvents) => {
      const firstEvent = {
        start: new Date(start),
        end: new Date(end),
      };
      return [...currentEvents, firstEvent];
    });
  };

  const onEventDrop: withDragAndDropProps["onEventDrop"] = (data) => {
    console.log(data);
  };

  return (
    <div style={{ height: "calc(100vh - 320px)" }}>
      <DnDCalendar
        defaultView="month"
        events={events}
        localizer={localizer}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        resizable
      />
    </div>
  );
};

const locales = {
  "en-US": enUS,
};
const endOfHour = (date: Date): Date => addHours(startOfHour(date), 1);
const now = new Date();
const start = endOfHour(now);
const end = addHours(start, 2);
// The types here are `object`. Strongly consider making them better as removing `locales` caused a fatal error
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
//@ts-ignore
const DnDCalendar = withDragAndDrop(Calendar);

export default DashboardCalender;
