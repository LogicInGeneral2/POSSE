import * as React from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Upload_Button from "../commons/upload_button";
import {
  SupervisorsList,
  SupervisorsSelectionType,
} from "../../services/types";
import { useEffect, useState } from "react";
import { getSelectionLists } from "../../services";
import ErrorNotice from "../commons/error";
import LoadingSpinner from "../commons/loading";
import Toast from "../commons/snackbar";

export default function SupervisorsSelection({
  disabled,
  value,
  onChange,
  excludedNames,
}: {
  disabled: boolean;
  value: SupervisorsSelectionType | null;
  onChange: (newValue: SupervisorsSelectionType | null) => void;
  excludedNames: string[];
}) {
  const [sv_lists, setSVLists] = useState<SupervisorsList[]>([]);
  const options: SupervisorsSelectionType[] = sv_lists.map((supervisor) => ({
    name: supervisor.name,
    id: supervisor.id,
  }));
  const filter = createFilterOptions<SupervisorsSelectionType>();
  const [open, toggleOpen] = React.useState(false);
  const [dialogValue, setDialogValue] =
    React.useState<SupervisorsSelectionType>({
      name: "",
      proof: undefined,
    });
  const filteredOptions = options.filter(
    (option) => !excludedNames.includes(option.name)
  );
  const [isLoading, setIsloading] = useState(true);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchCourseOutlines = async () => {
      const data = await getSelectionLists();
      setSVLists(data.data);
      setIsloading(false);
    };
    fetchCourseOutlines();
  }, []);

  if (!sv_lists) {
    return <ErrorNotice />;
  }

  const handleClose = () => {
    setDialogValue({ name: "", proof: undefined });
    toggleOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dialogValue.name.trim()) {
      setToast({
        open: true,
        message: "Supervisor name is required",
        severity: "error",
      });
      return;
    }
    if (!dialogValue.proof) {
      setToast({
        open: true,
        message: "Proof of agreement is required for new supervisors",
        severity: "error",
      });
      return;
    }
    onChange({ name: dialogValue.name, proof: dialogValue.proof });
    handleClose();
  };

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Toast
            open={toast.open}
            message={toast.message}
            severity={toast.severity}
            onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          />
          <Autocomplete
            value={value}
            onChange={(_, newValue) => {
              if (typeof newValue === "string") {
                setTimeout(() => {
                  toggleOpen(true);
                  setDialogValue({ name: newValue, proof: undefined });
                });
              } else if (newValue && "inputValue" in newValue) {
                toggleOpen(true);
                setDialogValue({
                  name: newValue.inputValue ?? "",
                  proof: undefined,
                });
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
                } as SupervisorsSelectionType);
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
            disabled={disabled}
            renderInput={(params) => (
              <TextField {...params} label="Select Supervisor" />
            )}
          />
        </>
      )}

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
              onChange={(event) =>
                setDialogValue((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              label="Supervisor Name"
              type="text"
              variant="standard"
              required
            />

            <Upload_Button
              size={"100%"}
              disabled={false}
              onUpload={(files) => {
                setDialogValue((prev) => ({
                  ...prev,
                  proof: files.length > 0 ? files[0] : undefined,
                }));
              }}
            />
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
