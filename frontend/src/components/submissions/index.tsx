import { Box, Divider, Typography } from "@mui/material";
import "./style.css";
import SubmissionCards from "./accordian";
import LegendCard from "./card";
import { useEffect, useState } from "react";
import ErrorNotice from "../commons/error";
import { getUserSubmissionData } from "../../services";
import { SubmissionsMetaType } from "../../services/types";
import LoadingSpinner from "../commons/loading";

export const SubmissionsPage = () => {
  const [meta, setMeta] = useState<SubmissionsMetaType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUserSubmissionData();
        if (response) {
          setMeta(response);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!meta) {
    return <ErrorNotice />;
  }

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
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Box
            sx={{
              marginTop: "20px",
              marginBottom: "20px",
              height: "calc(100vh - 300px)",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              overflow: "auto",
              scrollbarWidth: "none",
            }}
          >
            {meta.map((submissionMeta: SubmissionsMetaType) => (
              <SubmissionCards
                key={submissionMeta.id}
                submission={submissionMeta.submission || []}
                feedback={submissionMeta.feedback || []}
                meta={submissionMeta}
              />
            ))}
          </Box>
        )}

        <Box>
          <LegendCard />
        </Box>
      </div>
    </>
  );
};
