import { Typography } from "@mui/material";

function ErrorNotice() {
  return (
    <div>
      <Typography
        sx={{ textAlign: "center", fontWeight: "bold", color: "error" }}
      >
        No data available.
      </Typography>
    </div>
  );
}

export default ErrorNotice;
