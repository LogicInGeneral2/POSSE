import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  Box,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Chip,
  MenuItem,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  IconButton,
  Popover,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  People as PeopleIcon,
  Score as ScoreIcon,
  List as ListIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { TotalMarks, MarkingScheme } from "../../services/types";

interface SummaryDashboardProps {
  totalMarks: TotalMarks[];
  markingSchemes: MarkingScheme[];
  course: "FYP1" | "FYP2";
  selectedSchemes: string[];
  setSelectedSchemes: React.Dispatch<React.SetStateAction<string[]>>;
}

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  totalMarks,
  markingSchemes,
  course,
  selectedSchemes,
  setSelectedSchemes,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  const summary = useMemo(() => {
    const totalStudents = totalMarks.length;
    const averageMarks =
      totalStudents > 0
        ? totalMarks.reduce((sum, row) => sum + row.total_mark, 0) /
          totalStudents
        : 0;
    const schemeCount = markingSchemes.length;

    const schemeAverages = selectedSchemes.map((schemeLabel) => {
      const schemeMarks = totalMarks.reduce(
        (sum, row) => sum + (row.breakdown[schemeLabel] || 0),
        0
      );
      return {
        label: schemeLabel,
        average: totalStudents > 0 ? schemeMarks / totalStudents : 0,
      };
    });

    return { totalStudents, averageMarks, schemeCount, schemeAverages };
  }, [totalMarks, markingSchemes, selectedSchemes]);

  const handleSchemeChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedSchemes(event.target.value as string[]);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteChip = (chipToDelete: string) => () => {
    setSelectedSchemes((prev) => prev.filter((chip) => chip !== chipToDelete));
  };

  const open = Boolean(anchorEl);

  return (
    <Box
      sx={{
        mb: 3,
        position: isSticky ? "sticky" : "relative",
        top: isSticky ? 0 : "auto",
        zIndex: isSticky ? 1000 : "auto",
        backgroundColor: "background.paper",
        boxShadow: isSticky ? 3 : 0,
        p: isSticky ? 2 : 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
          justifyContent: "space-between",
        }}
      >
        <Typography
          fontSize={"1.5rem"}
          color="primary"
          sx={{ fontWeight: "bold" }}
        >
          {course} Students Statistic
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          <Box
            sx={{
              p: "10px",
              m: "10px",
              display: "flex",
              gap: "10px",
              flexDirection: "column",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={isSticky}
                  onChange={(e) => setIsSticky(e.target.checked)}
                />
              }
              label="Sticky Dashboard"
            />
            <FormControl sx={{ width: 500 }} size="small">
              <InputLabel>Marking Schemes</InputLabel>
              <Select
                multiple
                value={selectedSchemes}
                onChange={handleSchemeChange}
                label="Marking Schemes"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        onDelete={handleDeleteChip(value)}
                        onMouseDown={(event) => event.stopPropagation()}
                      />
                    ))}
                  </Box>
                )}
              >
                {markingSchemes.map((scheme) => (
                  <MenuItem key={scheme.label} value={scheme.label}>
                    <Checkbox
                      checked={selectedSchemes.includes(scheme.label)}
                    />
                    <ListItemText primary={scheme.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Popover>
      </Box>
      <Grid container spacing={2}>
        <Grid size={summary.schemeAverages.length === 0 ? 4 : 3}>
          <Tooltip title="Total number of students in this course">
            <Card
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" },
                backgroundColor: "base.main",
              }}
              aria-label="Total Students"
            >
              <CardContent
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <PeopleIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Students
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.totalStudents}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Tooltip>
        </Grid>
        <Grid size={summary.schemeAverages.length === 0 ? 4 : 3}>
          <Tooltip title="Average total marks across all students">
            <Card
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" },
                backgroundColor: "base.main",
              }}
              aria-label="Average Marks"
            >
              <CardContent
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <ScoreIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Average Marks
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.averageMarks.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Tooltip>
        </Grid>
        <Grid size={summary.schemeAverages.length === 0 ? 4 : 3}>
          <Tooltip title="Number of marking schemes for this course">
            <Card
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" },
                backgroundColor: "base.main",
              }}
              aria-label="Marking Schemes"
            >
              <CardContent
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <ListIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Marking Schemes
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.schemeCount}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Tooltip>
        </Grid>
        {summary.schemeAverages.map((scheme) => (
          <Grid size={3} key={scheme.label}>
            <Tooltip title={`Average marks for ${scheme.label}`}>
              <Card
                sx={{
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.02)" },
                  backgroundColor: "base.main",
                }}
                aria-label={`Average ${scheme.label}`}
              >
                <CardContent
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <ScoreIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Avg {scheme.label}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {scheme.average.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SummaryDashboard;
