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

      const simplifiedChoices = supervisorChoices.map((supervisor, index) => {
        const priority = index + 1;

        if (!supervisor?.name) {
          throw new Error(
            `Supervisor name is required for choice #${priority}`
          );
        }

        const choice = {
          priority,
          supervisorId: supervisor.id || null,
          supervisorName: supervisor.name,
          topic: topic || null,
          mode: mode || "development",
        };

        if (supervisor.proof instanceof File) {
          formData.append(`proof_${priority}`, supervisor.proof);
        }

        return choice;
      });

      formData.append("choices", JSON.stringify(simplifiedChoices));

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

        const filledChoices: (SupervisorsSelectionType | null)[] = [
          null,
          null,
          null,
        ];

        data.forEach((choice: any) => {
          const index = choice.priority - 1;
          filledChoices[index] = {
            name: choice.supervisor_name,
            id: choice.supervisor_id,
          };
        });

        if (data.length > 0) {
          setTopic(data[0].topic || "");
          setMode(data[0].mode || "development");
        }

        setSupervisorChoices(filledChoices);
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
