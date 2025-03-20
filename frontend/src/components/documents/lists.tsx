import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid2 as Grid,
  Radio,
  RadioGroup,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import FileCard from "./cards";
import { typeOptions } from "../../modals/documents";
import React, { useMemo, useState } from "react";
import documentsData from "../../../data/documents.json";

const DocumentsList = () => {
  const [alignment, setAlignment] = useState("descending");
  const [sortBy, setSortBy] = useState("date");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, boolean>
  >(typeOptions.reduce((acc, type) => ({ ...acc, [type]: true }), {}));

  const handleAlignmentChange = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
    }
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFilters({
      ...selectedFilters,
      [event.target.name]: event.target.checked,
    });
  };

  const filteredAndSortedDocuments = useMemo(() => {
    return documentsData
      .filter((file) => selectedFilters[file.category])
      .sort((a, b) => {
        if (sortBy === "date") {
          return alignment === "ascending"
            ? new Date(a.uploadDate).getTime() -
                new Date(b.uploadDate).getTime()
            : new Date(b.uploadDate).getTime() -
                new Date(a.uploadDate).getTime();
        }
        if (sortBy === "title") {
          return alignment === "ascending"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
        if (sortBy === "type") {
          return alignment === "ascending"
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }
        return 0;
      });
  }, [alignment, sortBy, selectedFilters]);

  return (
    <Grid container spacing={2} sx={{ marginTop: "20px", height: "100%" }}>
      <Grid size={10} spacing={2}>
        <Grid container spacing={2} justifyContent="flex-start">
          {filteredAndSortedDocuments.map((file) => (
            <Grid
              key={file.id}
              size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
              sx={{ display: "flex" }}
            >
              <FileCard file={file} />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid
        size={2}
        sx={{
          backgroundColor: "#E9DADD",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <Stack direction="column" spacing={2}>
          {/* FILTER FOR SELECTING ASCENDING OR DESCENDING */}
          <ToggleButtonGroup
            color="primary"
            value={alignment}
            exclusive
            onChange={handleAlignmentChange}
            aria-label="alignment-toggle-button"
            sx={{ width: "100%" }}
          >
            <ToggleButton value="ascending" sx={{ width: "50%" }}>
              Ascending
            </ToggleButton>
            <ToggleButton value="descending" sx={{ width: "50%" }}>
              Descending
            </ToggleButton>
          </ToggleButtonGroup>

          {/* FILTER FOR SELECTING SORTING BY... */}
          <FormControl>
            <FormLabel>Sort By</FormLabel>
            <RadioGroup value={sortBy} onChange={handleSortChange}>
              <FormControlLabel value="type" control={<Radio />} label="TYPE" />
              <FormControlLabel value="date" control={<Radio />} label="DATE" />
              <FormControlLabel
                value="title"
                control={<Radio />}
                label="TITLE"
              />
            </RadioGroup>
          </FormControl>

          {/* FILTER FOR FILTERING RESULT */}
          <FormGroup>
            <FormLabel>Filter By</FormLabel>
            {typeOptions.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={selectedFilters[type]}
                    onChange={handleFilterChange}
                    name={type}
                  />
                }
                label={type}
              />
            ))}
          </FormGroup>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default DocumentsList;
