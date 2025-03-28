import { DateCalendar, PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { Badge } from "@mui/material";
import { format, startOfYear } from "date-fns";

interface CalendarProps {
  logDates: string[];
  selectedDate: string | null;
  onDateClick: (date: Date) => void;
}

export default function Calendar({
  logDates,
  selectedDate,
  onDateClick,
}: CalendarProps) {
  const handleChange = (newDate: Date | null) => {
    if (newDate) {
      onDateClick(newDate);
    }
  };

  const renderDay = (dayProps: PickersDayProps<Date>) => {
    const formattedDate = format(dayProps.day, "yyyy-MM-dd");
    const isMarked = logDates.includes(formattedDate);
    const isSelected = selectedDate === formattedDate;

    return (
      <Badge
        key={formattedDate}
        overlap="circular"
        color={isSelected ? "secondary" : "primary"}
        variant={isMarked ? "dot" : "standard"}
      >
        <PickersDay {...dayProps} />
      </Badge>
    );
  };

  return (
    <DateCalendar
      views={["year", "month", "day"]}
      onChange={handleChange}
      slots={{ day: renderDay }}
      minDate={startOfYear(new Date())}
      sx={{
        width: "100%",
        height: "150vh",
        backgroundColor: "#E9DADD",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        color: "white",
      }}
    />
  );
}
