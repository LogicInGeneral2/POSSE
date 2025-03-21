import * as React from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import supervisors from "../../../data/supervisors.json";
import Upload_Button from "../commons/upload_button";

interface SupervisorsType {
  inputValue?: string;
  name: string;
}

const options: SupervisorsType[] = supervisors.map((supervisor) => ({
  name: supervisor.name,
}));

const filter = createFilterOptions<SupervisorsType>();

export default function SupervisorsSelection({
  disabled,
  value,
  onChange,
  excludedNames,
}: {
  disabled: boolean;
  value: SupervisorsType | null;
  onChange: (newValue: SupervisorsType | null) => void;
  excludedNames: string[];
}) {
  const [open, toggleOpen] = React.useState(false);
  const [dialogValue, setDialogValue] = React.useState<SupervisorsType>({
    name: "",
  });
  const filteredOptions = options.filter(
    (option) => !excludedNames.includes(option.name)
  );

  const handleClose = () => {
    setDialogValue({ name: "" });
    toggleOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onChange({ name: dialogValue.name });
    handleClose();
  };

  return (
    <>
      <Autocomplete
        value={value}
        onChange={(_, newValue) => {
          if (typeof newValue === "string") {
            setTimeout(() => {
              toggleOpen(true);
              setDialogValue({ name: newValue });
            });
          } else if (newValue && "inputValue" in newValue) {
            toggleOpen(true);
            setDialogValue({ name: newValue.inputValue ?? "" });
          } else {
            onChange(newValue);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params).filter(
            (option) => !excludedNames.includes(option.name)
          );
          if (params.inputValue !== "") {
            filtered.push({
              inputValue: params.inputValue,
              name: `Add "${params.inputValue}"`,
            } as SupervisorsType);
          }
          return filtered;
        }}
        id="new-name-dialog"
        options={filteredOptions}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderOption={(props, option) => (
          <li {...props} key={option.name}>
            {option.name}
          </li>
        )}
        sx={{ width: "100%" }}
        freeSolo
        disabled={disabled} // Disable selection when not in edit mode
        renderInput={(params) => (
          <TextField {...params} label="Select Supervisor" />
        )}
      />

      {/* Dialog for Adding a Supervisor */}
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add a new supervisor</DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <DialogContentText>
              Please attach a screenshot as proof of agreement.
            </DialogContentText>

            {/* Supervisor Name Input */}
            <TextField
              autoFocus
              margin="dense"
              id="name"
              value={dialogValue.name}
              onChange={(event) => setDialogValue({ name: event.target.value })}
              label="Supervisor Name"
              type="text"
              variant="standard"
              required
            />

            <Upload_Button size={"100%"} />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
