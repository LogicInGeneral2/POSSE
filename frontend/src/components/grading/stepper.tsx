import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import grading_contents from "../../modals/grading";

const GradingStepper = ({ pic }: { pic: string }) => {
  const filteredContents = grading_contents.filter((item) => item.PIC === pic);
  const steps = filteredContents.map((item) => item.label);

  // State: Stores grades for each content in each step
  const [grades, setGrades] = useState<number[][]>(
    filteredContents.map((step) => new Array(step.contents.length).fill(0))
  );

  const [activeStep, setActiveStep] = useState(0);

  // Update grade for a specific content within a step
  const handleGradeChange = (
    stepIndex: number,
    contentIndex: number,
    value: number
  ) => {
    const updatedGrades = [...grades];
    updatedGrades[stepIndex][contentIndex] = value;
    setGrades(updatedGrades);
  };

  // Check if ALL contents in ALL steps have been graded
  const allGraded = grades.every((step) => step.every((grade) => grade > 0));

  // Compute total score
  const totalScore = grades.flat().reduce((acc, curr) => acc + curr, 0);

  // Compute scores per step
  const stepScores = grades.map((step) =>
    step.reduce((acc, curr) => acc + curr, 0)
  );

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSave = () => {
    console.log("Final Grades:", grades);
    console.log("Total Score:", totalScore);
    console.log("Step Scores:", stepScores);
    alert("Grades saved successfully!"); // Replace with API call or other logic
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === steps.length ? (
        <Box
          sx={{
            flexGrow: 1,
            height: "400px",
            overflow: "auto",
            justifyContent: "center",
          }}
        >
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Step</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stepScores.map((score, index) => (
                  <TableRow key={index}>
                    <TableCell>{steps[index]}</TableCell>
                    <TableCell>{score}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Total Score</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {totalScore}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, height: "400px", overflow: "auto" }}>
          <Typography
            sx={{
              mt: "20px",
              mb: "10px",
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
          >
            {steps[activeStep]}
          </Typography>
          <Stack
            divider={
              <Divider
                orientation="horizontal"
                flexItem
                sx={{
                  borderBottomWidth: 1,
                  borderColor: "primary.main",
                  mb: "10px",
                }}
              />
            }
          >
            {filteredContents[activeStep].contents.map((content, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ display: "flex", alignItems: "flex-end" }}>
                  {content}
                </Typography>
                <FormControl>
                  <RadioGroup
                    row
                    value={grades[activeStep][index]}
                    onChange={(e) =>
                      handleGradeChange(
                        activeStep,
                        index,
                        Number(e.target.value)
                      )
                    }
                  >
                    {[...Array(filteredContents[activeStep].marks)].map(
                      (_, idx) => (
                        <FormControlLabel
                          key={idx}
                          value={idx + 1}
                          control={<Radio />}
                          label={`${idx + 1}`}
                          labelPlacement="top"
                        />
                      )
                    )}
                  </RadioGroup>
                </FormControl>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleNext} disabled={!allGraded}>
            Finish
          </Button>
        ) : activeStep === steps.length ? (
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </Box>
    </Box>
  );
};

export default GradingStepper;
