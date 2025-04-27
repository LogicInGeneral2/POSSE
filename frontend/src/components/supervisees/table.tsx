import {
  Box,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  Tooltip,
  Chip,
} from "@mui/material";
import { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import DownloadDialog from "./downloadDialog";
import UploadDialog from "./uploadDialog";
import {
  courseOptions,
  DataTableProps,
  modeOptions,
  statusOptions,
  SuperviseeSubmission,
} from "../../services/types";
import { Action, action_options } from "./actions";
import { QuestionMarkRounded } from "@mui/icons-material";

export default function DataTable({
  data,
  category,
  onRefresh,
}: DataTableProps) {
  const [course_options, setCourseOptions] = useState<string[]>([]);
  const [status_options, setStatusOptions] = useState<string[]>([]);
  const [mode_options, setModeOptions] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [modes, setModes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<JSX.Element | null>(null);
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    setCourseOptions(courseOptions.map((option) => option.label));
    setStatusOptions(statusOptions.map((option) => option.label));
    setModeOptions(modeOptions.map((option) => option.label));
  }, []);

  const handleCoursesChange = (event: SelectChangeEvent<string[]>) => {
    setCourses(
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value
    );
  };

  const handleStatusesChange = (event: SelectChangeEvent<string[]>) => {
    setStatuses(
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value
    );
  };

  const handleModesChange = (event: SelectChangeEvent<string[]>) => {
    setModes(
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value
    );
  };

  const handleChangePage = (_event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (action: Action, row: SuperviseeSubmission) => {
    if (action.type === "dialog") {
      setDialogTitle(`${action.label} ${row.student.name}'s Submission`);
      setDialogContent(
        action.label === "Download Submission" ? (
          <DownloadDialog setOpenDialog={setOpenDialog} id={row.student.id} />
        ) : (
          <UploadDialog
            setOpenDialog={setOpenDialog}
            onRefresh={onRefresh}
            id={row.student.id}
          />
        )
      );
      setOpenDialog(true);
    } else if (action.type === "navigate" && action.path) {
      navigate(
        action.path +
          `?student=${row.student.id}&name=${row.student.name}&category=${category}`,
        {
          state: { rowData: row, category },
        }
      );
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    onRefresh();
  };

  const filteredData = data.filter(({ student, submissions }) => {
    return (
      (!courses.length || courses.includes(student.course ?? "")) &&
      (!statuses.length ||
        (statuses.includes("No Submission")
          ? submissions.length === 0 || submissions.every((sub) => !sub.status)
          : submissions.some((sub) => statuses.includes(sub.status)))) &&
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toString().includes(searchTerm)) &&
      (!modes.length || modes.includes(student.mode ?? ""))
    );
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Submitted":
        return "success";
      case "Reviewed":
        return "info";
      case "No Submission":
        return "error";
      default:
        return "error";
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        <TextField
          sx={{ width: "30%" }}
          size="small"
          variant="outlined"
          label="Search by Matric No. or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl sx={{ width: "20%" }} size="small">
          <InputLabel>Course</InputLabel>
          <Select
            multiple
            size="small"
            value={courses}
            onChange={handleCoursesChange}
            input={<OutlinedInput label="Tag" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {course_options.map((course) => (
              <MenuItem key={course} value={course}>
                <Checkbox checked={courses.includes(course)} />
                <ListItemText primary={course} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: "20%" }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            multiple
            size="small"
            value={statuses}
            onChange={handleStatusesChange}
            input={<OutlinedInput label="Tag" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {status_options.map((status) => (
              <MenuItem key={status} value={status}>
                <Checkbox checked={statuses.includes(status)} />
                <ListItemText primary={status} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: "20%" }} size="small">
          <InputLabel>Mode</InputLabel>
          <Select
            multiple
            size="small"
            value={modes}
            onChange={handleModesChange}
            input={<OutlinedInput label="Tag" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {mode_options.map((status) => (
              <MenuItem
                key={status}
                value={status}
                sx={{ textTransform: "capitalize" }}
              >
                <Checkbox checked={modes.includes(status)} />
                <ListItemText primary={status} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Matric No.</TableCell>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Course</TableCell>{" "}
              <TableCell align="center">Mode</TableCell>
              {category === "supervisor" ? (
                <TableCell align="center">
                  Progress{" "}
                  <Tooltip
                    title="The latest phase that has a submission."
                    placement="top"
                  >
                    <QuestionMarkRounded
                      sx={{
                        border: "1px solid",
                        borderRadius: "50%",
                        padding: "2px",
                        fontSize: "0.6rem",
                      }}
                    />
                  </Tooltip>
                </TableCell>
              ) : (
                <TableCell>Supervisor</TableCell>
              )}
              <TableCell align="center">
                Status{" "}
                <Tooltip
                  title="The status of the latest submission."
                  placement="top"
                >
                  <QuestionMarkRounded
                    sx={{
                      border: "1px solid",
                      borderRadius: "50%",
                      padding: "2px",
                      fontSize: "0.6rem",
                    }}
                  />
                </Tooltip>
              </TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(({ student, submissions, has_logbook }) => {
                const latestSubmission =
                  submissions[submissions.length - 1] || {};
                return (
                  <TableRow key={student.id}>
                    <TableCell align="center">{student.student_id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell align="center">{student.course}</TableCell>
                    <TableCell
                      align="center"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {student.mode}
                    </TableCell>
                    {category === "supervisor" ? (
                      <TableCell align="center">
                        {latestSubmission.assignment_title || "No Submission"}
                      </TableCell>
                    ) : (
                      <TableCell>{student.supervisor || "N/A"}</TableCell>
                    )}
                    <TableCell align="center">
                      <Chip
                        variant="outlined"
                        label={latestSubmission.status || "No Submission"}
                        color={getStatusColor(latestSubmission.status)}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {action_options.map((action) => (
                        <Tooltip key={action.label} title={action.label} arrow>
                          <span>
                            {action.label === "View Logbook" ? (
                              <IconButton
                                onClick={() =>
                                  handleActionClick(action as Action, {
                                    student,
                                    submissions,
                                  })
                                }
                                disabled={!has_logbook}
                                color="primary"
                                size="small"
                                sx={{
                                  border: "1px solid",
                                  padding: "0.15rem",
                                  mx: "5px",
                                }}
                              >
                                {action.icon}
                              </IconButton>
                            ) : action.label === "Grade Submission" ? (
                              <IconButton
                                onClick={() =>
                                  handleActionClick(action as Action, {
                                    student,
                                    submissions,
                                  })
                                }
                                color="primary"
                                size="small"
                                sx={{
                                  border: "1px solid",
                                  padding: "0.15rem",
                                  mx: "5px",
                                }}
                              >
                                {action.icon}
                              </IconButton>
                            ) : (
                              <IconButton
                                onClick={() =>
                                  handleActionClick(action as Action, {
                                    student,
                                    submissions,
                                  })
                                }
                                disabled={!latestSubmission.src}
                                color="primary"
                                size="small"
                                sx={{
                                  border: "1px solid",
                                  padding: "0.15rem",
                                  mx: "5px",
                                }}
                              >
                                {action.icon}
                              </IconButton>
                            )}
                          </span>
                        </Tooltip>
                      ))}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        {dialogContent}
      </Dialog>
    </>
  );
}
