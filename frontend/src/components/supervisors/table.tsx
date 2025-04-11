import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import SupervisorsSelection from "./select";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import { Student, SupervisorsSelectionType } from "../../services/types";
import { getSupervisorChoices, saveSupervisorChoices } from "../../services";
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
      const formData = new FormData();

      formData.append("studentId", student.id.toString());

      const simplifiedChoices = supervisorChoices.map((supervisor, index) => {
        const priority = index + 1;

        if (!supervisor?.name) {
          alert(`Supervisor name is required for choice #${priority}`);
          return;
        }

        const choice = {
          priority,
          supervisorId: supervisor?.id || null,
          supervisorName: supervisor.name,
        };

        if (supervisor?.proof instanceof File) {
          formData.append(`proof_${priority}`, supervisor.proof);
        }

        return choice;
      });

      formData.append("choices", JSON.stringify(simplifiedChoices));

      await saveSupervisorChoices(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving supervisor choices:", error);
    }
  };

  useEffect(() => {
    const fetchSupervisorChoices = async () => {
      try {
        const data = await getSupervisorChoices(student.id);
        const filledChoices: (SupervisorsSelectionType | null)[] = [
          null,
          null,
          null,
        ];

        data.data.forEach((choice: any) => {
          const index = choice.priority - 1;
          filledChoices[index] = {
            name: choice.supervisor_name,
            id: choice.supervisor_id,
          };
        });

        setSupervisorChoices(filledChoices);
      } catch (error) {
        console.error("Error fetching supervisor choices:", error);
      }
    };

    fetchSupervisorChoices();
  }, [student.id]);

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
        disabled={!!supervisor}
        sx={{ borderRadius: "8px", marginTop: "20px", width: "100px" }}
      >
        {isEditing ? "Save" : "Edit"}
      </Button>
    </>
  );
}
