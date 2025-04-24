import { Divider, Typography } from "@mui/material";
import DocumentsList from "./lists";

export const DocumentsPage = () => {
  return (
    <>
      <div
        style={{
          height: "100%",
        }}
      >
        <Typography
          fontSize={"3rem"}
          color="primary"
          sx={{ fontWeight: "bold" }}
        >
          Documents
        </Typography>

        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />

        <DocumentsList />
      </div>
    </>
  );
};
