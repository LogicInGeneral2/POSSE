import { Box, Divider, Typography } from "@mui/material";
import submissionsData from "../../../data/submissions.json";
import "./style.css";
import SubmissionCards from "./accordian";
import SubmissionsType from "./submissionsType";
import LegendCard from "./card";

export const SubmissionsPage = () => {
  return (
    <>
      <div
        style={{
          height: "100%",
        }}
      >
        <Typography
          fontSize={"3rem"}
          color="secondary"
          sx={{ fontWeight: "bold" }}
        >
          Submissions
        </Typography>

        <Divider
          sx={{
            borderBottomWidth: 2,
            borderColor: "primary.main",
            marginBottom: "20px",
          }}
        />
        <Box
          sx={{
            marginTop: "20px",
            height: "calc(100vh - 280px)",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 0.75,
            overflow: "auto",
            scrollbarWidth: "none",
          }}
        >
          {submissionsData.map((file: SubmissionsType) => (
            <SubmissionCards file={file} />
          ))}
        </Box>
        <Box>
          <LegendCard />
        </Box>
      </div>
    </>
  );
};
