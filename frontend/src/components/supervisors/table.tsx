import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import SupervisorsSelection from "./select";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import { Student, SupervisorsSelectionType } from "../../services/types";
import { getSupervisorChoices, saveSupervisorChoices } from "../../services";
import Toast from "../commons/snackbar";

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
  const [cgpa, setCgpa] = useState<number>(0);
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

  const handleSave = async () => {
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
          cgpa: cgpa,
        };

        if (supervisor?.proof instanceof File) {
          formData.append(
            `proof_${["first", "second", "third"][index]}`,
            supervisor.proof
          );
        }

        return choice;
      });

      // Merge choices into a single object
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
        message: error.message || "Failed to save choices. Please try again.",
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
          setCgpa(data.cgpa || 0);
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
      <Paper
        sx={{
          padding: "10px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          mb: "10px",
        }}
      >
        <Toast
          open={toast.open}
          message={toast.message}
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        />
        <FormControl fullWidth>
          <InputLabel>FYP Mode</InputLabel>
          <Select
            value={mode || "development"}
            label="FYP Mode"
            onChange={handleChange}
            disabled={!isEditing}
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
          value={cgpa || 0}
          onChange={(e) => setCgpa(Number(e.target.value))}
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
      <TableContainer>
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
      <Button
        variant="contained"
        color="primary"
        onClick={isEditing ? handleSave : handleToggleEdit}
        disabled={!!supervisor}
        sx={{ borderRadius: "8px", marginTop: "20px", width: "100px" }}
      >
        {isEditing ? "Save" : "Edit"}
      </Button>
    </>
  );
}
