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
import { JSX, useState } from "react";
import {
  course_options,
  status_options,
  action_options,
} from "../../modals/supervisees";
import { useNavigate } from "react-router";
import { SupervisorsTableProps, Action, Supervisee } from "./superviseesType";
import DownloadDialog from "./downloadDialog";
import UploadDialog from "./uploadDialog";

export default function DataTable({ data }: SupervisorsTableProps) {
  const [courses, setCourses] = useState<string[]>(
    course_options.map((c) => c.label)
  );
  const [statuses, setStatuses] = useState<string[]>(
    status_options.map((s) => s.label)
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<JSX.Element>();
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const navigate = useNavigate();

  const handleCoursesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setCourses(typeof value === "string" ? value.split(",") : value);
  };

  const handleStatusesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setStatuses(typeof value === "string" ? value.split(",") : value);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (action: Action, row: Supervisee) => {
    if (action.type === "dialog") {
      if (action.label === "Download Submission") {
        setDialogTitle(`${action.label}ing ${row.name}'s Submission:`);
        setDialogContent(<DownloadDialog setOpenDialog={setOpenDialog} />);
      } else if (action.label === "Upload Feedback") {
        setDialogTitle(`${action.label}ing ${row.name}'s Feedback:`);
        setDialogContent(<UploadDialog setOpenDialog={setOpenDialog} />);
      }
      setOpenDialog(true);
    } else if (action.type === "navigate" && action.path) {
      navigate(action.path, { state: { rowData: row } });
    }
  };

  const filteredData = data.filter((row) => {
    return (
      courses.includes(row.progress) &&
      statuses.includes(row.status) &&
      (row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.id.toString().includes(searchTerm))
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
        <FormControl sx={{ width: "20%" }}>
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
              <MenuItem key={course.label} value={course.label}>
                <Checkbox checked={courses.includes(course.label)} />
                <ListItemText primary={course.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ width: "20%" }}>
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
              <MenuItem key={status.label} value={status.label}>
                <Checkbox checked={statuses.includes(status.label)} />
                <ListItemText primary={status.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer>
        <Table aria-label="supervisors table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Matric No.</TableCell>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Course</TableCell>
              <TableCell align="center">Progress</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell align="center">{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="center">{row.course}</TableCell>
                  <TableCell align="center">{row.progress}</TableCell>
                  <TableCell align="center">{row.status}</TableCell>
                  <TableCell align="center">
                    {action_options.map((action) => (
                      <Tooltip
                        key={action.label}
                        title={action.label}
                        arrow
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: "offset",
                                options: {
                                  offset: [0, -8],
                                },
                              },
                            ],
                          },
                        }}
                      >
                        <IconButton
                          key={action.label}
                          onClick={() =>
                            handleActionClick(action as Action, row)
                          }
                        >
                          {action.icon}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Dialog for View and Download Actions */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        {dialogContent}
      </Dialog>
    </>
  );
}
