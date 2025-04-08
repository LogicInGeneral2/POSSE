import { Box, Button, Container, Typography } from "@mui/material";
import { Link } from "react-router";
export const ErrorRoute = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Typography variant="h3" color="error" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          sx={{ marginTop: 2 }}
        >
          Go to Homepage
        </Button>
      </Container>
    </Box>
  );
};
