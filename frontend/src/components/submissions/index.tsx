import { Box, Divider, Typography } from "@mui/material";
import "./style.css";
import SubmissionCards from "./accordian";
import LegendCard from "../commons/legends";
import { useEffect, useState } from "react";
import ErrorNotice from "../commons/error";
import {
  getSubmissionStatusThemes,
  getUserSubmissionData,
} from "../../services";
import { StatusInfo, SubmissionsMetaType } from "../../services/types";
import LoadingSpinner from "../commons/loading";
import { useUser } from "../../../context/UserContext";
import { getStatusInfo } from "./status";

export const SubmissionsPage = () => {
  const [meta, setMeta] = useState<SubmissionsMetaType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const [statusInfo, setStatusInfo] = useState<StatusInfo[]>([]);

  const fetchSubmissions = async () => {
    if (user && user.id) {
      setIsLoading(true);
      try {
        const response = await getUserSubmissionData(user.id);
        console.log(response);
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
    const loadThemes = async () => {
      const themes = await getSubmissionStatusThemes();
      const statusData = getStatusInfo(themes);
      setStatusInfo(statusData);
    };
    loadThemes();
  }, []);

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
          color="primary"
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
              gap: "20px",
              overflow: "auto",
              scrollbarWidth: "none",
              alignItems: meta.length === 0 ? "center" : "initial",
              justifyContent: meta.length === 0 ? "center" : "initial",
            }}
          >
            {meta.length === 0 ? (
              <Typography variant="h6" color="primary">
                No submissions available yet.
              </Typography>
            ) : (
              meta.map((submissionMeta: SubmissionsMetaType) => (
                <SubmissionCards
                  key={submissionMeta.id}
                  submission={submissionMeta.submission || []}
                  feedback={submissionMeta.feedback || []}
                  meta={submissionMeta}
                  refreshSubmissions={fetchSubmissions}
                  statusInfo={statusInfo}
                />
              ))
            )}
          </Box>
        )}

        <Box>
          <LegendCard statusInfo={statusInfo} />
        </Box>
      </div>
    </>
  );
};
