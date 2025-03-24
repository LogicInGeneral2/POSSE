import { Box, CircularProgress } from "@mui/material";

const Loader = () => {
  return (
    <>
      <Box
        sx={{
          position: "fixed",
          width: "100%",
          height: "100%",
          top: 0,
          backgroundColor: "rgba(50,50,50,0.2)",
          zIndex: 1001,
          backdropFilter: "blur(5px)",
        }}
      />
      <Box
        sx={{
          position: "fixed",
          zIndex: 1100,
          display: "flex",
          width: "100%",
          height: "100%",
          top: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress color="primary" size={120} thickness={5} />
      </Box>
    </>
  );
};

export default Loader;
