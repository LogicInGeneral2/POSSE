import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const LoadingSpinner = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <CircularProgress size={50} thickness={4} />
    </Box>
  );
};

export default LoadingSpinner;
