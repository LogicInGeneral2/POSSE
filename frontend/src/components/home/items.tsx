import { Box, Typography } from "@mui/material";
import { AnnouncementTypes } from "../../services/types";

export function Item({ item }: { item: AnnouncementTypes }) {
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
