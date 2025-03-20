import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import SupervisorsSelection from "./select";
import { Button } from "@mui/material";
import React from "react";

interface SupervisorsType {
  inputValue?: string;
  name: string;
}

export default function SupervisorsTable() {
  const [isEditing, setIsEditing] = React.useState(false);
  const [supervisorChoices, setSupervisorChoices] = React.useState<
    (SupervisorsType | null)[]
  >([null, null, null]); // Store selected supervisors for each priority

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);

    /*const handleToggleEdit = () => {
  if (isEditing) {
    // When saving, send data to backend
    fetch("/api/supervisors", {
      method: "POST", // Or PUT if updating existing data
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supervisorChoices),
    })
      .then((res) => res.json())
      .then((data) => console.log("Saved:", data))
      .catch((err) => console.error("Error saving supervisors:", err));
  }
  setIsEditing((prev) => !prev);
};
*/
  };

  const handleSupervisorChange = (
    index: number,
    newSupervisor: SupervisorsType | null
  ) => {
    setSupervisorChoices((prev) => {
      const updatedChoices = [...prev];
      updatedChoices[index] = newSupervisor;
      return updatedChoices;
    });
  };

  return (
    <>
      <TableContainer>
        <Table aria-label="simple table">
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
                    value={supervisorChoices[index]}
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
        onClick={handleToggleEdit}
        sx={{ borderRadius: "8px", marginTop: "20px", width: "100px" }}
      >
        {isEditing ? "Save" : "Edit"}
      </Button>
    </>
  );
}
