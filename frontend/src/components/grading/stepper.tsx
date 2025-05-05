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
import Toast from "../commons/snackbar";

const GradingStepper = ({ student }: { student: number }) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [gradingContents, setGradingContents] = useState<GradingContentsType[]>(
    []
  );
  const [grades, setGrades] = useState<{ [schemeId: number]: number[] }>({});
  const [activeStep, setActiveStep] = useState(0);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const schemeData = await getMarkingScheme(student);
        if (schemeData) {
          setGradingContents(schemeData);
          setGrades(
            schemeData.reduce(
              (
                acc: { [schemeId: number]: number[] },
                scheme: GradingContentsType
              ) => {
                acc[scheme.id] = new Array(scheme.contents.length).fill(0);
                return acc;
              },
              {}
            )
          );
        }
        const gradesData = await getGrades(student);
        if (gradesData && gradesData.length) {
          setGrades((prevGrades) => {
            const updatedGrades = { ...prevGrades };
            gradesData.forEach(
              (grade: { scheme: { id: number }; grades: number[] }) => {
                updatedGrades[grade.scheme.id] = grade.grades;
              }
            );
            return updatedGrades;
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    setActiveStep(0);
  }, [student]);

  const steps = gradingContents.map((item) => item.label);

  if (!gradingContents.length) {
    return <ErrorNotice />;
  }

  const handleGradeChange = (
    schemeId: number,
    contentIndex: number,
    value: number
  ): void => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [schemeId]: prevGrades[schemeId].map((grade, j) =>
        j === contentIndex ? value : grade
      ),
    }));
  };

  const allGraded = gradingContents.every((scheme) =>
    grades[scheme.id].every((grade) => grade >= 0)
  );
  const stepScores = gradingContents.map((scheme: GradingContentsType) =>
    grades[scheme.id].reduce((acc, curr) => acc + curr, 0)
  );
  const totalScore = stepScores.reduce((acc, curr) => acc + curr, 0);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleSave = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID not found");
      }
      const gradesPayload = gradingContents.map(
        (scheme: GradingContentsType) => ({
          scheme_id: scheme.id,
          grades: grades[scheme.id],
        })
      );
      await saveGrades({
        studentId: student,
        user_id: user.id,
        grades: gradesPayload,
      });
      setToast({
        open: true,
        message: "Grades saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving grades:", error);
      setToast({
        open: true,
        message: "Failed to save grades. Please try again.",
        severity: "error",
      });
    }
  };

  const activeScheme = gradingContents[activeStep];
  const handleGradeChangeWrapper = (contentIndex: number, value: number) => {
    handleGradeChange(activeScheme.id, contentIndex, value);
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
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
                gradingContents={gradingContents} // Pass gradingContents for max scores
              />
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1, height: "500px", overflow: "auto" }}>
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
                  {[...Array(activeScheme.marks + 1)].map((_, idx) => (
                    <Typography
                      key={idx}
                      sx={{
                        width: "40px",
                        textAlign: "left",
                        mr: 0.5,
                      }}
                    >
                      {idx}
                    </Typography>
                  ))}
                </Box>

                {/* Content Rows */}
                {activeScheme.contents.map((content, index) => (
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
                        value={grades[activeScheme.id][index] || 0}
                        onChange={(e) =>
                          handleGradeChangeWrapper(
                            index,
                            Number(e.target.value)
                          )
                        }
                        sx={{ display: "flex", gap: 2 }}
                      >
                        {[...Array(activeScheme.marks + 1)].map((_, idx) => (
                          <FormControlLabel
                            key={idx}
                            value={idx}
                            control={<Radio />}
                            label=""
                          />
                        ))}
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
          </Box>{" "}
          <Toast
            open={toast.open}
            message={toast.message}
            severity={toast.severity}
            onClose={handleCloseToast}
          />
        </Box>
      )}
    </>
  );
};

export default GradingStepper;
