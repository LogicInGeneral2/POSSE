import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import SupervisorsSelection from "./select";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import { Student, SupervisorsSelectionType } from "../../services/types";
import { getSupervisorChoices, saveSupervisorChoices } from "../../services";
import Toast from "../commons/snackbar";
import { ErrorRounded } from "@mui/icons-material";

interface SupervisorsTableProps {
  supervisor: string;
}

export default function SupervisorsTable({
  supervisor,
}: SupervisorsTableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useUser();
  const student = user as Student;
  const [supervisorChoices, setSupervisorChoices] = useState<
    (SupervisorsSelectionType | null)[]
  >([null, null, null]);
  const [mode, setMode] = useState<string>("development");
  const [topic, setTopic] = useState<string>("");
  const [cgpa, setCgpa] = useState<number | string>("");
  const [cgpaError, setCgpaError] = useState<string>("");
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleSupervisorChange = (
    index: number,
    newSupervisor: SupervisorsSelectionType | null
  ) => {
    setSupervisorChoices((prev) => {
      const updatedChoices = [...prev];
      updatedChoices[index] = newSupervisor;
      return updatedChoices;
    });
  };

  const validateCgpa = (value: string) => {
    const numValue = Number(value);
    if (value === "") {
      return "CGPA is required";
    }
    if (isNaN(numValue) || numValue <= 0) {
      return "CGPA must be greater than 0";
    }
    if (numValue > 4.0) {
      return "CGPA cannot exceed 4.0";
    }
    return "";
  };

  const handleCgpaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCgpa(value);
    setCgpaError(validateCgpa(value));
  };

  const handleSave = async () => {
    const cgpaValidationError = validateCgpa(cgpa.toString());
    if (cgpaValidationError) {
      setCgpaError(cgpaValidationError);
      setToast({
        open: true,
        message: cgpaValidationError,
        severity: "error",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("studentId", student.id.toString());

      const choices = supervisorChoices.map((supervisor, index) => {
        const choice = {
          [`${["first", "second", "third"][index]}Id`]: supervisor?.id || null,
          [`${["first", "second", "third"][index]}Name`]:
            supervisor?.name || null,
          topic: topic || null,
          mode: mode || "development",
          cgpa: Number(cgpa),
        };

        if (supervisor?.proof instanceof File) {
          formData.append(
            `proof_${["first", "second", "third"][index]}`,
            supervisor.proof
          );
        }

        return choice;
      });

      const mergedChoices = Object.assign({}, ...choices);
      formData.append("choices", JSON.stringify(mergedChoices));

      await saveSupervisorChoices(formData);
      setIsEditing(false);
      setToast({
        open: true,
        message: "Supervisor choices saved successfully!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error saving supervisor choices:", error);
      setToast({
        open: true,
        message: "Failed to save choices. Please try again.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const fetchSupervisorChoices = async () => {
      try {
        const response = await getSupervisorChoices(student.id);
        const data = response.data;

        if (data) {
          setSupervisorChoices([
            data.first_id || data.first_name
              ? { id: data.first_id, name: data.first_name }
              : null,
            data.second_id || data.second_name
              ? { id: data.second_id, name: data.second_name }
              : null,
            data.third_id || data.third_name
              ? { id: data.third_id, name: data.third_name }
              : null,
          ]);
          setTopic(data.topic || "");
          setMode(data.mode || "development");
          setCgpa(data.cgpa || "");
        }
      } catch (error) {
        console.error("Error fetching supervisor choices:", error);
      }
    };

    fetchSupervisorChoices();
  }, [student.id]);

  const handleChange = (event: SelectChangeEvent) => {
    setMode(event.target.value as string);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", p: 2, flex: 1 }}>
          <ErrorRounded
            color="error"
            sx={{ mr: 1, mt: "4px", fontSize: "1rem" }}
          />
          <Typography
            sx={{ fontSize: "1rem", color: "error.main", textAlign: "left" }}
          >
            Supervisor Selection Period is currently ongoing. Select your FYP
            mode and topic (if any) and rank your top three preferred
            supervisors. Alternatively, add a new supervisor below if they are
            not from the SE program, together with a screenshot as proof of
            agreement.{" "}
            <b>Type in a new name to add new lecturers, and provide proof.</b>
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", p: 2 }}>
          <Toast
            open={toast.open}
            message={toast.message}
            severity={toast.severity}
            onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={!!supervisor}
            onClick={isEditing ? handleSave : handleToggleEdit}
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            sx={{ fontWeight: "bold", color: "secondary.main" }}
          >
            {isEditing ? "Save Selections" : "Edit Selections"}
          </Button>
        </Box>
      </Box>

      <Paper
        sx={{
          padding: "20px",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          textAlign: "left",
        }}
      >
        <FormControl fullWidth>
          <InputLabel>FYP Mode</InputLabel>
          <Select
            value={mode || "development"}
            label="FYP Mode"
            onChange={handleChange}
            disabled={!isEditing}
            fullWidth
          >
            <MenuItem value="development">Development</MenuItem>
            <MenuItem value="research">Research</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Current CGPA"
          variant="outlined"
          type="number"
          fullWidth
          disabled={!isEditing}
          value={cgpa}
          onChange={handleCgpaChange}
          error={!!cgpaError}
          helperText={cgpaError}
          inputProps={{ min: 0, max: 4.0, step: 0.01 }}
        />
        <TextField
          label="FYP Topic (Optional)"
          variant="outlined"
          fullWidth
          disabled={!isEditing}
          value={topic || ""}
          onChange={(e) => setTopic(e.target.value)}
        />
      </Paper>
      <TableContainer sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "10%", fontSize: "1rem" }} align="center">
                Priority
              </TableCell>
              <TableCell align="center" sx={{ fontSize: "1rem" }}>
                Supervisor
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3].map((priority, index) => (
              <TableRow key={priority}>
                <TableCell component="th" scope="row" align="center">
                  {priority}
                </TableCell>
                <TableCell component="th" scope="row" sx={{ padding: "10px" }}>
                  <SupervisorsSelection
                    disabled={!isEditing}
                    value={supervisorChoices[index] || null}
                    excludedNames={supervisorChoices
                      .filter((s): s is SupervisorsSelectionType => s !== null)
                      .map((s) => s.name)}
                    onChange={(newValue) =>
                      handleSupervisorChange(index, newValue)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
