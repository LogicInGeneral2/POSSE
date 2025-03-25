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
import React, { useEffect, useMemo, useState } from "react";
import { getDocumentOptions, getDocuments } from "../../services";
import ErrorNotice from "../commons/error";
import { DocumentType, OptionType } from "../../services/types";
import LoadingSpinner from "../commons/loading";
const DocumentsList = () => {
  const [alignment, setAlignment] = useState("descending");
  const [sortBy, setSortBy] = useState("date");
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [isLoading, setIsloading] = useState(true);
  const [options, setOptions] = useState<OptionType[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const fetchDocuments = async () => {
      const data = await getDocuments();
      setDocuments(data);
      setIsloading(false);
    };
    const fetchOptions = async () => {
      const data: OptionType[] = await getDocumentOptions();
      setOptions(data);
      setSelectedFilters(
        data.reduce((acc, option) => ({ ...acc, [option.label]: true }), {})
      );
    };
    fetchDocuments();
    fetchOptions();
  }, []);

  if (!documents) {
    return <ErrorNotice />;
  }

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
    setSelectedFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  const filteredAndSortedDocuments = useMemo(() => {
    return documents
      .filter((file) => selectedFilters[file.category])
      .sort((a, b) => {
        if (sortBy === "date") {
          return alignment === "ascending"
            ? new Date(a.upload_date).getTime() -
                new Date(b.upload_date).getTime()
            : new Date(b.upload_date).getTime() -
                new Date(a.upload_date).getTime();
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
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {filteredAndSortedDocuments.map((file) => (
                <Grid
                  key={file.id}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                  sx={{ display: "flex" }}
                >
                  <FileCard file={file} />
                </Grid>
              ))}
            </>
          )}
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
            {options.map((option) => (
              <FormControlLabel
                key={option.label}
                control={
                  <Checkbox
                    checked={selectedFilters[option.label] ?? false}
                    onChange={handleFilterChange}
                    name={option.label}
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default DocumentsList;
