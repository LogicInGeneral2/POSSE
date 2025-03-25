import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import SupervisorsSelection from "./select";
import { Button } from "@mui/material";
import React from "react";
import { useUser } from "../../../context/UserContext";
import { Student, SupervisorsSelectionType } from "../../services/types";
import { saveSupervisorChoices } from "../../services";

export default function SupervisorsTable() {
  const [isEditing, setIsEditing] = React.useState(false);
  const { user } = useUser();
  const student = user as Student;
  const [supervisorChoices, setSupervisorChoices] = React.useState<
    (SupervisorsSelectionType | null)[]
  >([null, null, null]); // Store selected supervisors for each priority

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
      const payload = {
        studentId: student.id,
        choices: supervisorChoices.map((supervisor, index) => ({
          priority: index + 1,
          //supervisorId: supervisor?.id || null,
          supervisorName: supervisor?.name || null,
        })),
      };

      await saveSupervisorChoices(payload);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving supervisor choices:", error);
    }
  };

  return (
    <>
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
                <TableCell component="th" scope="row">
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
        color="secondary"
        onClick={isEditing ? handleSave : handleToggleEdit}
        disabled={!!student?.supervisor}
        sx={{ borderRadius: "8px", marginTop: "20px", width: "100px" }}
      >
        {isEditing ? "Save" : "Edit"}
      </Button>
    </>
  );
}
