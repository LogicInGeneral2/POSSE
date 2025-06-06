import {
  BookRounded,
  CalendarMonth,
  DriveFolderUpload,
  ErrorRounded,
  EventBusyRounded,
  SupervisedUserCircleRounded,
} from "@mui/icons-material";
import {
  Box,
  ButtonBase,
  Grid2 as Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { JSX, useEffect, useState } from "react";
import { getPeriod } from "../../services";
import LoadingSpinner from "../commons/loading";
import { periodTypes } from "../../services/types";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import ErrorNotice from "../commons/error";
import InfoIcon from "@mui/icons-material/Info";
import FolderIcon from "@mui/icons-material/Folder";
import HomeIcon from "@mui/icons-material/Home";

const iconMap: Record<string, JSX.Element> = {
  supervisors: (
    <SupervisedUserCircleRounded
      sx={{ fontSize: "2rem", color: "secondary.main" }}
    />
  ),
  submissions: (
    <DriveFolderUpload sx={{ fontSize: "2rem", color: "secondary.main" }} />
  ),
  logs: <BookRounded sx={{ fontSize: "2rem", color: "secondary.main" }} />,
  home: <HomeIcon sx={{ fontSize: "2rem", color: "secondary.main" }} />,
  documents: <FolderIcon sx={{ fontSize: "2rem", color: "secondary.main" }} />,
  course_outline: (
    <InfoIcon sx={{ fontSize: "2rem", color: "secondary.main" }} />
  ),
};

export function Status({ isStudent }: { isStudent: Boolean }) {
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [period, setPeriod] = useState<periodTypes>();
  const navigator = useNavigate();

  useEffect(() => {
    const fetchPeriod = async () => {
      const period = await getPeriod();
      setPeriod(period);
      setIsloading(false);
    };
    fetchPeriod();
  }, []);

  if (!period) {
    return <ErrorNotice />;
  }

  return (
    <Paper
      sx={{
        border: "1px solid",
        padding: "5px",
        borderRadius: "8px",
        minheight: "80px",
      }}
    >
      <Grid container>
        {isLoading ? (
          <Grid size={12}>
            <LoadingSpinner />
          </Grid>
        ) : (
          <>
            <Grid
              size={isStudent ? 6 : 7}
              sx={{ display: "flex", flexDirection: "column", p: "10px" }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ marginBottom: "10px", flexShrink: 0 }}
              >
                <Box
                  sx={{
                    width: "10px",
                    backgroundColor: "base.main",
                    borderTopLeftRadius: "8px",
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "25px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ErrorRounded sx={{ mr: 1 }} />
                  {period.title}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    width: "10px",
                    backgroundColor: "base.main",
                    borderBottomLeftRadius: "8px",
                  }}
                />

                <Typography sx={{ fontSize: "1rem" }}>
                  {period.description}
                </Typography>
              </Stack>
            </Grid>
            {isStudent && (
              <Grid size={1} sx={{ p: "10px" }}>
                {period.directory && (
                  <Tooltip title="Take Me There!" placement="top">
                    <ButtonBase
                      sx={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "primary.main",
                        color: "orange",
                        borderTopRightRadius: "8px",
                        borderBottomRightRadius: "8px",
                        textAlign: "center",
                        display: "flex",
                        border: "2px solid secondary.main",
                      }}
                      onClick={() => {
                        navigator(`/${period.directory}`);
                      }}
                    >
                      {iconMap[period.directory as keyof typeof iconMap] || (
                        <ErrorRounded sx={{ color: "primary.main" }} />
                      )}
                    </ButtonBase>
                  </Tooltip>
                )}
              </Grid>
            )}

            <Grid
              size={5}
              sx={{
                p: "10px",
                display: "flex",
                flexDirection: "row",
                gap: "10px",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "base.main",
                  p: "10px",
                  borderTopLeftRadius: "8px",
                  borderBottomLeftRadius: "8px",
                  border: "1px solid",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  flex: 1,
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>START DATE</Typography>
                <CalendarMonth
                  sx={{ fontSize: "3rem", color: "primary.main" }}
                />
                <Typography sx={{ fontWeight: "bold" }}>
                  {period.start_date
                    ? format(new Date(period.start_date), "dd MMM yyyy")
                    : "N/A"}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: "base.main",
                  p: "10px",
                  border: "1px solid",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  flex: 1,
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>END DATE</Typography>
                <EventBusyRounded
                  sx={{ fontSize: "3rem", color: "primary.main" }}
                />
                <Typography sx={{ fontWeight: "bold" }}>
                  {period.start_date
                    ? format(new Date(period.start_date), "dd MMM yyyy")
                    : "N/A"}{" "}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: "base.main",
                  p: "10px",
                  borderTopRightRadius: "8px",
                  borderBottomRightRadius: "8px",
                  border: "1px solid",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  flex: 0.5,
                }}
              >
                <Typography sx={{ fontWeight: "bold", fontSize: "2.5rem" }}>
                  {period.days_left}
                </Typography>
                <Typography sx={{ fontWeight: "bold" }}>DAYS LEFT</Typography>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
}
