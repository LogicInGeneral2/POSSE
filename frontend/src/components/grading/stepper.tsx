import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getGrades, getMarkingScheme, saveGrades } from "../../services";
import ErrorNotice from "../commons/error";
import { useUser } from "../../../context/UserContext";
import LoadingSpinner from "../commons/loading";
import { GradingContentsType } from "../../services/types";
import ScoreTable from "./finaltable";

const GradingStepper = ({ pic, student }: { pic: string; student: string }) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [gradingContents, setGradingContents] = useState<GradingContentsType[]>(
    []
  );
  const [grades, setGrades] = useState<number[][]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schemeData = await getMarkingScheme();
        if (schemeData) {
          setGradingContents(schemeData);
        }
        const gradesData = await getGrades(student);
        if (gradesData) {
          setGrades(
            schemeData.map((step: GradingContentsType, stepIndex: number) =>
              step.contents.map(
                (_, contentIndex: number) =>
                  gradesData[stepIndex * step.contents.length + contentIndex] ||
                  0
              )
            )
          );
        } else {
          setGrades(
            schemeData.map((step: GradingContentsType) =>
              new Array(step.contents.length).fill(0)
            )
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const steps = gradingContents.map((item) => item.label);

  if (!gradingContents.length) {
    return <ErrorNotice />;
  }

  const handleGradeChange = (
    stepIndex: number,
    contentIndex: number,
    value: number
  ): void => {
    setGrades((prevGrades) => {
      const updatedGrades = prevGrades.map((step, i) =>
        i === stepIndex
          ? step.map((grade, j) => (j === contentIndex ? value : grade))
          : step
      );
      return updatedGrades;
    });
  };

  const allGraded = grades.every((step) => step.every((grade) => grade > 0));
  const totalScore = grades.flat().reduce((acc, curr) => acc + curr, 0);
  const stepScores = grades.map((step) =>
    step.reduce((acc, curr) => acc + curr, 0)
  );

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleSave = async () => {
    try {
      const payload = {
        student_id: student,
        user_id: user?.id,
        pic: pic,
        grades: grades.flat(),
      };
      console.log(payload);
      await saveGrades(payload);
      alert("Grades saved successfully!");
    } catch (error) {
      console.error("Error saving grades:", error);
      alert("Failed to save grades.");
    }
  };

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
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
              <ScoreTable
                steps={steps}
                stepScores={stepScores}
                totalScore={totalScore}
              />
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
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    gap: 2,
                    mb: 1,
                  }}
                >
                  {[...Array(gradingContents[activeStep].marks)].map(
                    (_, idx) => (
                      <Typography
                        key={idx}
                        sx={{
                          width: "40px",
                          textAlign: "left",
                          mr: 0.5,
                        }}
                      >
                        {idx + 1}
                      </Typography>
                    )
                  )}
                </Box>

                {/* Content Rows */}
                {gradingContents[activeStep].contents.map((content, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography>{content}</Typography>
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
                        sx={{ display: "flex", gap: 2 }}
                      >
                        {[...Array(gradingContents[activeStep].marks)].map(
                          (_, idx) => (
                            <FormControlLabel
                              key={idx}
                              value={idx + 1}
                              control={<Radio />}
                              label=""
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
      )}
    </>
  );
};

export default GradingStepper;
