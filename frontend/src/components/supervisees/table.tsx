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
import { DataTableProps, SuperviseeSubmission } from "../../services/types";
import { getSuperviseesModal } from "../../services";
import { Action, action_options } from "./actions";

export default function DataTable({ data, category }: DataTableProps) {
  const [course_options, setCourseOptions] = useState<string[]>([]);
  const [progress_options, setProgressOptions] = useState<string[]>([]);
  const [status_options, setStatusOptions] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [progresses, setProgresses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<JSX.Element | null>(null);
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuperviseesModal = async () => {
      try {
        const data = await getSuperviseesModal();

        setCourseOptions(
          data.courses_options.map((option: { label: string }) => option.label)
        );
        setProgressOptions(
          data.progress_options.map((option: { label: string }) => option.label)
        );
        setStatusOptions(
          data.status_options.map((option: { label: string }) => option.label)
        );
      } catch (error) {
        console.error("Error fetching supervisees modal:", error);
      }
    };

    fetchSuperviseesModal();
  }, []);

  const handleCoursesChange = (event: SelectChangeEvent<string[]>) => {
    setCourses(
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value
    );
  };

  const handleProgressesChange = (event: SelectChangeEvent<string[]>) => {
    setProgresses(
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
          <DownloadDialog setOpenDialog={setOpenDialog} />
        ) : (
          <UploadDialog setOpenDialog={setOpenDialog} />
        )
      );
      setOpenDialog(true);
    } else if (action.type === "navigate" && action.path) {
      navigate(action.path, { state: { rowData: row, category } });
    }
  };

  const filteredData = data.filter(({ student, submissions }) => {
    return (
      (!courses.length || courses.includes(student.course ?? "")) &&
      (!progresses.length ||
        submissions.some((sub) => progresses.includes(sub.progress))) &&
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
        {category === "supervisor" && (
          <FormControl sx={{ width: "20%" }} size="small">
            <InputLabel>Progress</InputLabel>
            <Select
              multiple
              size="small"
              value={progresses}
              onChange={handleProgressesChange}
              input={<OutlinedInput label="Tag" />}
              renderValue={(selected) => selected.join(", ")}
            >
              {progress_options.map((progress) => (
                <MenuItem key={progress} value={progress}>
                  <Checkbox checked={progresses.includes(progress)} />
                  <ListItemText primary={progress} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

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
              {category === "sv" ? (
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
              .map(({ student, submissions }) => {
                const latestSubmission =
                  submissions[submissions.length - 1] || {};
                return (
                  <TableRow key={student.id}>
                    <TableCell align="center">{student.student_id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell align="center">{student.course}</TableCell>
                    {category === "sv" ? (
                      <TableCell align="center">
                        {latestSubmission.progress || "N/A"}
                      </TableCell>
                    ) : (
                      <TableCell>{student.supervisor || "N/A"}</TableCell>
                    )}

                    <TableCell align="center">
                      {latestSubmission.status || "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      {action_options.map((action) => (
                        <Tooltip key={action.label} title={action.label} arrow>
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
