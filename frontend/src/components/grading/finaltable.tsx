import { Grid2 as Grid, Box } from "@mui/material";
import { GradingContentsType } from "../../services/types";

type ScoreTableProps = {
  steps: string[];
  stepScores: number[];
  totalScore: number;
  gradingContents: GradingContentsType[];
};

const ScoreTable = ({
  steps,
  stepScores,
  totalScore,
  gradingContents,
}: ScoreTableProps) => {
  const maxScores = gradingContents.map(
    (scheme) => scheme.marks * scheme.contents.length
  );
  const totalMaxScore = maxScores.reduce((acc, curr) => acc + curr, 0);

  return (
    <Box sx={{ p: 3, mt: 2, borderRadius: 2 }}>
      <Grid container spacing={2}>
        <Grid
          container
          size={12}
          sx={{ fontWeight: "bold", borderBottom: 1, pb: 1 }}
        >
          <Grid size={6}>Criterias</Grid>
          <Grid size={6}>Score / Max Score</Grid>
        </Grid>
        {stepScores.map((score, index) => (
          <Grid
            container
            size={12}
            key={index}
            sx={{ py: 1, borderBottom: 1, borderColor: "divider" }}
          >
            <Grid size={6}>{steps[index]}</Grid>
            <Grid size={6}>
              {score} / {maxScores[index]}
            </Grid>
          </Grid>
        ))}
        <Grid container size={12} sx={{ fontWeight: "bold", pt: 2 }}>
          <Grid size={6}>Total Score</Grid>
          <Grid size={6}>
            {totalScore} / {totalMaxScore}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScoreTable;
