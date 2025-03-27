import { Grid2 as Grid, Box } from "@mui/material";

type ScoreTableProps = {
  steps: string[];
  stepScores: number[];
  totalScore: number;
};

const ScoreTable = ({ steps, stepScores, totalScore }: ScoreTableProps) => {
  return (
    <Box sx={{ p: 3, mt: 2, borderRadius: 2 }}>
      <Grid container spacing={2}>
        <Grid
          container
          size={12}
          sx={{ fontWeight: "bold", borderBottom: 1, pb: 1 }}
        >
          <Grid size={6}>Criterias</Grid>
          <Grid size={6}>Score</Grid>
        </Grid>
        {stepScores.map((score, index) => (
          <Grid
            container
            size={12}
            key={index}
            sx={{ py: 1, borderBottom: 1, borderColor: "divider" }}
          >
            <Grid size={6}>{steps[index]}</Grid>
            <Grid size={6}>{score}</Grid>
          </Grid>
        ))}
        <Grid container size={12} sx={{ fontWeight: "bold", pt: 2 }}>
          <Grid size={6}>Total Score</Grid>
          <Grid size={6}>{totalScore}</Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScoreTable;
