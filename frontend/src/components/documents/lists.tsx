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
import {
  getDocumentModes,
  getDocumentOptions,
  getDocuments,
} from "../../services";
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
  const [modeFilter, setModeFilter] = useState<OptionType[]>([]);
  const [selectedMode, setSelectedMode] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchDocuments = async () => {
      const data = await getDocuments();
      setDocuments(data.data);
      setIsloading(false);
    };
    const fetchOptions = async () => {
      const data: OptionType[] = (await getDocumentOptions()).data;
      setOptions(data);
      setSelectedFilters(
        data.reduce((acc, option) => ({ ...acc, [option.label]: true }), {})
      );
    };
    const fetchModes = async () => {
      const data: OptionType[] = (await getDocumentModes()).data;
      setModeFilter(data);
      setSelectedMode(
        data.reduce(
          (acc, modeFilter) => ({ ...acc, [modeFilter.label]: true }),
          {}
        )
      );
    };
    fetchDocuments();
    fetchModes();
    fetchOptions();
  }, []);

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

  const handleModeFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedMode((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  const filteredAndSortedDocuments = useMemo(() => {
    if (
      Object.keys(selectedFilters).length === 0 ||
      Object.keys(selectedMode).length === 0
    )
      return [];

    return documents
      .filter(
        (file) => selectedFilters[file.category] && selectedMode[file.mode]
      )
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
  }, [documents, alignment, sortBy, selectedFilters, selectedMode]);

  return (
    <Grid container spacing={2} sx={{ marginTop: "20px", height: "100%" }}>
      <Grid size={10}>
        <Grid container spacing={2} justifyContent="flex-start">
          {isLoading ? (
            <LoadingSpinner />
          ) : documents.length === 0 ? (
            <ErrorNotice />
          ) : filteredAndSortedDocuments.length > 0 ? (
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
          ) : (
            <ErrorNotice />
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
            <ToggleButton value="ascending" sx={{ width: "50%" }} size="small">
              Ascending
            </ToggleButton>
            <ToggleButton value="descending" sx={{ width: "50%" }} size="small">
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

          {/* FILTER FOR FILTERING BY CATEGORY */}
          <FormGroup>
            <FormLabel>Filter By Category</FormLabel>
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

          {/* FILTER FOR FILTERING BY MODE */}
          <FormGroup>
            <FormLabel>Filter By Mode</FormLabel>
            {modeFilter.map((mode) => (
              <FormControlLabel
                key={mode.label}
                control={
                  <Checkbox
                    checked={selectedMode[mode.label] ?? false}
                    onChange={handleModeFilterChange}
                    name={mode.label}
                  />
                }
                label={mode.label}
              />
            ))}
          </FormGroup>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default DocumentsList;
