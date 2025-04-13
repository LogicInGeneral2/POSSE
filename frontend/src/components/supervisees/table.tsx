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
} from "@mui/material";
import { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import DownloadDialog from "./downloadDialog";
import UploadDialog from "./uploadDialog";
import {
  courseOptions,
  DataTableProps,
  statusOptions,
  SuperviseeSubmission,
} from "../../services/types";
import { Action, action_options } from "./actions";

export default function DataTable({ data, category }: DataTableProps) {
  const [course_options, setCourseOptions] = useState<string[]>([]);
  const [status_options, setStatusOptions] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
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
          <UploadDialog setOpenDialog={setOpenDialog} id={row.student.id} />
        )
      );
      setOpenDialog(true);
    } else if (action.type === "navigate" && action.path) {
      navigate(action.path, {
        state: { rowData: row, category },
      });
    }
  };

  const filteredData = data.filter(({ student, submissions }) => {
    return (
      (!courses.length || courses.includes(student.course ?? "")) &&
      (!statuses.length ||
        submissions.some((sub) => statuses.includes(sub.status))) &&
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toString().includes(searchTerm))
    );
  });

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
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Matric No.</TableCell>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Course</TableCell>
              {category === "supervisor" ? (
                <TableCell align="center">Progress</TableCell>
              ) : (
                <TableCell>Supervisor</TableCell>
              )}
              <TableCell align="center">Status</TableCell>
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
                    {category === "supervisor" ? (
                      <TableCell align="center">
                        {latestSubmission.progress || "No Submission"}
                      </TableCell>
                    ) : (
                      <TableCell>{student.supervisor || "N/A"}</TableCell>
                    )}

                    <TableCell align="center">
                      {latestSubmission.status || "No Submission"}
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        {dialogContent}
      </Dialog>
    </>
  );
}
