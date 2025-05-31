import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Box,
  Paper,
  TextField,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Checkbox,
  Tooltip,
  Chip,
  ListItemText,
  IconButton,
  Popover,
} from "@mui/material";
import { TotalMarks, MarkingScheme } from "../../services/types";
import SummaryDashboard from "./SummaryDashboard";
import { Settings as SettingsIcon } from "@mui/icons-material";

const extractStudentName = (student: string): string => {
  if (!student) return "Unknown";
  const match = student.match(/^(.+?)(?:\s*\((FYP1|FYP2)\))?$/);
  return match ? match[1].trim() : student.trim();
};

interface TotalMarksTableProps {
  totalMarks: TotalMarks[];
  markingSchemes: MarkingScheme[];
}

const TotalMarksTable: React.FC<TotalMarksTableProps> = ({
  totalMarks,
  markingSchemes,
}) => {
  const [tabValue, setTabValue] = useState<"FYP1" | "FYP2">("FYP1");
  const [search, setSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSchemes, setSelectedSchemes] = useState<string[]>([]);
  const [minGrade, setMinGrade] = useState("");
  const [maxGrade, setMaxGrade] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "student",
    ...markingSchemes.map((s) => s.label),
    "total_mark",
  ]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Filter by tab, search, and grade range for table display
  const filteredRowData = useMemo(() => {
    let data = totalMarks.filter((row) => row.course === tabValue);
    if (search) {
      data = data.filter((row) =>
        row.student.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (minGrade !== "") {
      const min = parseFloat(minGrade);
      if (!isNaN(min)) {
        data = data.filter((row) => row.total_mark >= min);
      }
    }
    if (maxGrade !== "") {
      const max = parseFloat(maxGrade);
      if (!isNaN(max)) {
        data = data.filter((row) => row.total_mark <= max);
      }
    }
    return data;
  }, [totalMarks, tabValue, search, minGrade, maxGrade]);

  // Filter for dashboard calculations based on selected students
  const dashboardRowData = useMemo(() => {
    let data = totalMarks.filter((row) => row.course === tabValue);
    if (selectedStudents.length > 0) {
      data = data.filter((row) => selectedStudents.includes(row.id.toString()));
    }
    return data;
  }, [totalMarks, tabValue, selectedStudents]);

  // Filter marking schemes by tab
  const filteredSchemes = useMemo(
    () => markingSchemes.filter((scheme) => scheme.course === tabValue),
    [markingSchemes, tabValue]
  );

  // Sort data for table
  const sortedRowData = useMemo(() => {
    if (!sortColumn) return filteredRowData;
    return [...filteredRowData].sort((a, b) => {
      let valueA, valueB;
      if (sortColumn === "student") {
        valueA = a.student.toLowerCase();
        valueB = b.student.toLowerCase();
      } else if (sortColumn === "total_mark") {
        valueA = a.total_mark;
        valueB = b.total_mark;
      } else {
        // Breakdown column
        valueA = a.breakdown[sortColumn] || 0;
        valueB = b.breakdown[sortColumn] || 0;
      }
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRowData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedRowData = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRowData.slice(start, start + rowsPerPage);
  }, [sortedRowData, page, rowsPerPage]);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: "FYP1" | "FYP2"
  ) => {
    setTabValue(newValue);
    setPage(0);
    setSelectedStudents([]);
    setSelectedSchemes([]);
    setSearch("");
    setMinGrade("");
    setMaxGrade("");
    setVisibleColumns([
      "student",
      ...markingSchemes
        .filter((s) => s.course === newValue)
        .map((s) => s.label),
      "total_mark",
    ]);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedStudents(
        totalMarks
          .filter((row) => row.course === tabValue)
          .map((row) => row.id.toString())
      );
    } else {
      setSelectedStudents([]);
    }
  };

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(event.target.value as number);
    setPage(0);
  };

  const handleColumnChange = (event: SelectChangeEvent<string[]>) => {
    setVisibleColumns(event.target.value as string[]);
  };

  const handleDeleteColumnChip = (chipToDelete: string) => () => {
    setVisibleColumns((prev) => prev.filter((chip) => chip !== chipToDelete));
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Dashboard Summary */}
      <SummaryDashboard
        totalMarks={dashboardRowData}
        markingSchemes={filteredSchemes}
        course={tabValue}
        selectedSchemes={selectedSchemes}
        setSelectedSchemes={setSelectedSchemes}
      />

      {/* Tabs and Filters */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="course tabs"
        >
          <Tab label="FYP1" value="FYP1" />
          <Tab label="FYP2" value="FYP2" />
        </Tabs>
      </Box>
      <Box
        sx={{
          display: "flex",
          mb: 2,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "left", gap: "10px" }}>
          <TextField
            label="Search By Name"
            value={search}
            onChange={handleSearchChange}
            size="small"
            sx={{ width: 500 }}
          />
          <TextField
            label="Min Marks"
            value={minGrade}
            onChange={(e) => setMinGrade(e.target.value)}
            type="number"
            size="small"
            sx={{ width: 120 }}
          />
          <TextField
            label="Max Marks"
            value={maxGrade}
            onChange={(e) => setMaxGrade(e.target.value)}
            type="number"
            size="small"
            sx={{ width: 120 }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "right", gap: "10px" }}>
          <Tooltip title="Settings">
            <IconButton
              onClick={handleClick}
              aria-label="settings"
              color="primary"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <FormControl sx={{ width: 300, m: "10px" }} size="small">
            <InputLabel>Visible Columns</InputLabel>
            <Select
              multiple
              value={visibleColumns}
              onChange={handleColumnChange}
              label="Visible Columns"
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={
                        value === "student"
                          ? "Name"
                          : value === "total_mark"
                          ? "Total Marks"
                          : value
                      }
                      onDelete={handleDeleteColumnChip(value)}
                      onMouseDown={(event) => event.stopPropagation()}
                    />
                  ))}
                </Box>
              )}
            >
              {/* Remove "select" from the options */}
              {[
                "student",
                ...filteredSchemes.map((s) => s.label),
                "total_mark",
              ].map((col) => (
                <MenuItem key={col} value={col}>
                  <Checkbox checked={visibleColumns.includes(col)} />
                  <ListItemText
                    primary={
                      col === "student"
                        ? "Name"
                        : col === "total_mark"
                        ? "Total Marks"
                        : col
                    }
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Popover>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "calc(100vh - 350px)", overflow: "auto" }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {/* Always show checkbox column */}
              <TableCell>
                <Checkbox
                  checked={
                    selectedStudents.length ===
                    totalMarks.filter((row) => row.course === tabValue).length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              {visibleColumns.includes("student") && (
                <TableCell
                  onClick={() => handleSort("student")}
                  sx={{ cursor: "pointer" }}
                >
                  Name{" "}
                  {sortColumn === "student" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
              )}
              {filteredSchemes
                .filter((scheme) => visibleColumns.includes(scheme.label))
                .map((scheme) => (
                  <TableCell
                    key={scheme.label}
                    align="center"
                    onClick={() => handleSort(scheme.label)}
                    sx={{ cursor: "pointer" }}
                  >
                    <Tooltip title={`Weight: ${scheme.weightage}%`}>
                      <span>
                        {scheme.label}{" "}
                        {sortColumn === scheme.label &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </span>
                    </Tooltip>
                  </TableCell>
                ))}
              {visibleColumns.includes("total_mark") && (
                <TableCell
                  onClick={() => handleSort("total_mark")}
                  sx={{ cursor: "pointer" }}
                >
                  Total Marks{" "}
                  {sortColumn === "total_mark" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRowData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 1} // +1 for the checkbox column
                  align="center"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedRowData.map((row) => (
                <TableRow key={row.id}>
                  {/* Always show checkbox */}
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.includes(row.id.toString())}
                      onChange={() => handleStudentSelect(row.id.toString())}
                    />
                  </TableCell>
                  {visibleColumns.includes("student") && (
                    <TableCell>{extractStudentName(row.student)}</TableCell>
                  )}
                  {filteredSchemes
                    .filter((scheme) => visibleColumns.includes(scheme.label))
                    .map((scheme) => (
                      <TableCell key={scheme.label} align="center">
                        {row.breakdown[scheme.label] || 0}
                      </TableCell>
                    ))}
                  {visibleColumns.includes("total_mark") && (
                    <TableCell>{row.total_mark}</TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", mt: "20px" }}
      >
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Rows per page</InputLabel>
          <Select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            label="Rows per page"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
          </Select>
        </FormControl>
        <TablePagination
          rowsPerPageOptions={[]}
          component="div"
          count={sortedRowData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
        />
      </Box>
    </Box>
  );
};

export default TotalMarksTable;
