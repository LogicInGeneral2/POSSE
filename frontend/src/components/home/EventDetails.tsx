import React from "react";
import { Stack, Box, Typography } from "@mui/material";

export const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
}) => {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {icon}
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {value || "N/A"}
        </Typography>
      </Box>
    </Stack>
  );
};
