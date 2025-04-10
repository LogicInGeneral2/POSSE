import { Box, Divider, Typography } from "@mui/material";
import "./style.css";
import SubmissionCards from "./accordian";
import LegendCard from "./card";
import { useEffect, useState } from "react";
import ErrorNotice from "../commons/error";
import { getUserSubmissionData } from "../../services";
import { SubmissionsMetaType } from "../../services/types";
import LoadingSpinner from "../commons/loading";
import { useUser } from "../../../context/UserContext";

export const SubmissionsPage = () => {
  const [meta, setMeta] = useState<SubmissionsMetaType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  const fetchSubmissions = async () => {
    if (user && user.id) {
      setIsLoading(true);
      try {
        const response = await getUserSubmissionData(user.id);
        if (response) {
          setMeta(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

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
                refreshSubmissions={fetchSubmissions}
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
