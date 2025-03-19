import Carousel from "react-material-ui-carousel";
import { Box, Typography } from "@mui/material";
import announcement from "../../../data/announcement.json";

interface AnnouncementItem {
  id: number;
  src: string;
  title: string;
  message: string;
}

function Item({ item }: { item: AnnouncementItem }) {
  return (
    <Box
      sx={{
        gap: "1rem",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <Typography sx={{ fontWeight: "bold" }}>{item.title}</Typography>
      <Typography>{item.message}</Typography>
      <iframe
        src={item.src}
        width="100%"
        style={{ border: "none", minHeight: "300px" }}
      />
    </Box>
  );
}

function Announcements() {
  return (
    <Carousel >
      {announcement.map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </Carousel>
  );
}

export default Announcements;
