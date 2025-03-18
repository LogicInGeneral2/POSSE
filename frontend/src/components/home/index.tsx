import Box from "@mui/material/Box";
import "./style.css";
import {
  Stack,
  Typography,
  Divider,
  Grid2 as Grid,
  ButtonBase,
} from "@mui/material";
import {
  SupervisorAccountRounded,
  WatchLaterRounded,
  Announcement,
  ErrorRounded,
  CalendarMonth,
  EventBusyRounded,
} from "@mui/icons-material";

export const HomePage = () => {
  return (
    <>
      <div
        style={{
          height: "100%",
        }}
      >
        <Typography fontSize={"3rem"} color="secondary">
          Welcome back, Ahmad Jalkhan
        </Typography>

        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
        <Grid container spacing={2} sx={{ marginTop: "20px", height: "100%" }}>
          <Grid size={4} sx={{ height: "100%" }}>
            <Stack direction="column" sx={{ height: "100%" }}>
              <Grid
                container
                spacing={2}
                sx={{
                  border: "1px solid #58041D",
                  borderRadius: "8px",
                  alignContent: "center",
                }}
              >
                <Grid
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                >
                  <SupervisorAccountRounded sx={{ mr: 1 }} /> Supervisor:
                  Maimoon binti Moustapa
                </Grid>

                <Grid
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <WatchLaterRounded sx={{ mr: 1 }} /> Session: 23/24
                </Grid>
              </Grid>

              <Stack
                direction="column"
                spacing={2}
                sx={{
                  mt: "20px",
                  border: "1px solid #58041D",
                  backgroundColor: "#E9DADD",
                  borderRadius: "8px",
                  padding: "12px",
                  height: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "25px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  ANNOUNCEMENT <Announcement sx={{ ml: 1 }} />
                </Typography>

                <Divider
                  sx={{ borderBottomWidth: 2, borderColor: "primary.main" }}
                />

                <Typography sx={{ fontWeight: "bold" }}>TITLE HERE</Typography>
                <Typography>
                  This is where the describtion goes.
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ. 1234567890.
                  abcdefghijklmnopqrstuvwxyz.
                </Typography>
                <iframe
                  src="../../../data/CHAPTER 1 - PROJECT.pdf"
                  width="100%"
                  height={"100%"}
                  style={{ border: "none" }}
                />
              </Stack>
            </Stack>
          </Grid>

          <Grid size={8} spacing={2} sx={{ height: "100%" }}>
            <Stack spacing={2} sx={{ width: "100%" }}>
              <Grid
                container
                sx={{
                  border: "1px solid #58041D",
                  padding: "5px",
                  borderRadius: "8px",
                  minheight: "80px",
                }}
              >
                <Grid
                  size={6}
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
                        backgroundColor: "#E9DADD",
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
                      Supervisor Selection Period
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        width: "10px",
                        backgroundColor: "#E9DADD",
                        borderBottomLeftRadius: "8px",
                      }}
                    />

                    <Typography sx={{ fontSize: "1rem" }}>
                      Navigate to the supervisor tab and select three
                      supervisors that you would like to have.
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={1} sx={{ p: "10px" }}>
                  <ButtonBase
                    sx={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#58041D",
                      color: "orange",
                      borderTopRightRadius: "8px",
                      borderBottomRightRadius: "8px",
                      textAlign: "center",
                      display: "flex",
                      border: "2px solid #F8AB04",
                      boxShadow:
                        "0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <SupervisorAccountRounded />
                  </ButtonBase>
                </Grid>
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
                      backgroundColor: "#E9DADD",
                      p: "10px",
                      borderTopLeftRadius: "8px",
                      borderBottomLeftRadius: "8px",
                      border: "1px solid #58041D",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      flex: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold" }}>
                      START DATE
                    </Typography>
                    <CalendarMonth sx={{ fontSize: "3rem" }} />
                    <Typography sx={{ fontWeight: "bold" }}>
                      28 SEP 2024
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: "#E9DADD",
                      p: "10px",
                      border: "1px solid #58041D",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      flex: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold" }}>
                      END DATE
                    </Typography>
                    <EventBusyRounded sx={{ fontSize: "3rem" }} />
                    <Typography sx={{ fontWeight: "bold" }}>
                      28 SEP 2024
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: "#E9DADD",
                      p: "10px",
                      borderTopRightRadius: "8px",
                      borderBottomRightRadius: "8px",
                      border: "1px solid #58041D",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      flex: 0.5,
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold", fontSize: "2.5rem" }}>
                      30
                    </Typography>
                    <Typography sx={{ fontWeight: "bold" }}>
                      DAYS LEFT
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box>TESTING</Box>
            </Stack>
          </Grid>
        </Grid>
      </div>
    </>
  );
};
