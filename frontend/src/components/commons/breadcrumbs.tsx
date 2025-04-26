import {
  Autocomplete,
  Breadcrumbs,
  Chip,
  emphasize,
  Link,
  Menu,
  MenuItem,
  styled,
  TextField,
  Typography,
  Box,
  Tooltip,
  IconButton,
  Divider,
  DialogTitle,
  Dialog,
} from "@mui/material";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate, useLocation } from "react-router";
import { JSX, useEffect, useState } from "react";
import {
  BreadcrumbUser,
  BreadcrumbInfo,
  BreadcrumbData,
} from "../../services/types";
import "./style.css";
import {
  getCurrentStudent,
  getStudents,
  getUserSubmissionList,
} from "../../services";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TopicIcon from "@mui/icons-material/Topic";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DownloadDialog from "../supervisees/downloadDialog";
import UploadDialog from "../supervisees/uploadDialog";

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor: "transparent",
  height: theme.spacing(3),
  color: theme.palette.primary.main,
  fontSize: "1rem",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  "& .MuiChip-deleteIcon": {
    color: theme.palette.primary.main,
  },
  "&:hover, &:focus": {
    backgroundColor: emphasize(theme.palette.secondary.main, 0.06),
  },
  "&:active": {
    boxShadow: theme.shadows[1],
    backgroundColor: emphasize(theme.palette.secondary.main, 0.12),
  },
}));

interface Navigations {
  url: string;
  name: string;
}

export default function Breadcrumb({
  receivedName,
  category,
  currentPage,
}: {
  receivedName: string;
  category: string;
  currentPage: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = new URLSearchParams(location.search).get("student");
  const submissionId = new URLSearchParams(location.search).get("submission");
  const [data, setData] = useState<BreadcrumbUser[]>([]);
  const [anchorPages, setAnchorPages] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<BreadcrumbData | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<BreadcrumbData | null>(
    null
  );
  const [names, setNames] = useState<BreadcrumbData[]>([]);
  const [submissions, setSubmissions] = useState<BreadcrumbData[]>([]);
  const [breadcrumbInfo, setBreadcrumbInfo] = useState<BreadcrumbInfo | null>(
    null
  );
  const [infoLoading, setInfoLoading] = useState(false);
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [dialogContent, setDialogContent] = useState<JSX.Element | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const pages: Navigations[] = [
    { url: "/grading", name: "Grading" },
    { url: "/viewing", name: "Viewing" },
    { url: "/logs", name: "Logs" },
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await getStudents(category);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching supervisees:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [category]);

  const getStudentsList = (path: string) => {
    if (path === "/grading") {
      return data.map((item) => ({
        id: item.id.toString(),
        name: item.name,
      }));
    }
    return data
      .filter((item) => {
        if (path === "/viewing") {
          return item.submissionsLength > 0;
        }
        if (path === "/logs") {
          return item.has_logbook;
        }
        return false;
      })
      .map((item) => ({
        id: item.id.toString(),
        name: item.name,
      }));
  };

  const getStudentSubmissions = async (studentId: string) => {
    try {
      const submissionList = await getUserSubmissionList(Number(studentId));
      setSubmissions(
        submissionList.data.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setSubmissions([]);
    }
  };

  const getBreadcrumbInfo = async (studentId: string) => {
    setInfoLoading(true);
    try {
      const data = await getCurrentStudent(Number(studentId));
      setBreadcrumbInfo(data);
    } catch (error) {
      console.error("Error fetching breadcrumb info:", error);
      setBreadcrumbInfo(null);
    } finally {
      setInfoLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      setNames(getStudentsList(location.pathname));
    } else {
      setNames([]);
      setSubmissions([]);
    }
  }, [data, location.pathname, isLoading]);

  useEffect(() => {
    if (studentId && names.length > 0) {
      const foundStudent = names.find((student) => student.id === studentId);
      if (foundStudent) {
        setSelectedStudent(foundStudent);
        getBreadcrumbInfo(studentId);
        if (location.pathname === "/viewing") {
          getStudentSubmissions(studentId);
        } else {
          setSubmissions([]);
          setSelectedSubmission(null);
        }
      } else {
        setSelectedStudent(null);
        setBreadcrumbInfo(null);
        setSubmissions([]);
        setSelectedSubmission(null);
      }
    } else {
      setSelectedStudent(null);
      setBreadcrumbInfo(null);
      setSubmissions([]);
      setSelectedSubmission(null);
    }
  }, [studentId, names, location.pathname]);

  useEffect(() => {
    if (submissionId && submissions.length > 0) {
      const foundSubmission = submissions.find(
        (submission) => submission.id === submissionId
      );
      if (foundSubmission) {
        setSelectedSubmission(foundSubmission);
      } else {
        setSelectedSubmission(null);
      }
    } else {
      setSelectedSubmission(null);
    }
  }, [submissionId, submissions]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate(
      `/supervisees?tab=${
        category === "supervisor" ? "supervisees" : "evaluatees"
      }`
    );
  };

  const handleChangePages = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorPages(event.currentTarget);
  };

  const handleClosePages = () => {
    setAnchorPages(null);
  };

  const handleSelectStudent = (
    student: { id: string; name: string } | null
  ) => {
    if (student) {
      setSelectedStudent(student);
      setSelectedSubmission(null);
      if (location.pathname === "/viewing") {
        navigate(
          `${location.pathname}?student=${student.id}&name=${student.name}&category=${category}`
        );
      } else {
        navigate(
          `${location.pathname}?student=${student.id}&name=${student.name}&category=${category}`
        );
      }
    }
  };

  const handleSelectSubmission = (
    submission: { id: string; name: string } | null
  ) => {
    if (submission && selectedStudent) {
      setSelectedSubmission(submission);
      navigate(
        `${location.pathname}?student=${selectedStudent.id}&name=${selectedStudent.name}&category=${category}&submission=${submission.id}`
      );
    }
  };

  const handleSelectPage = (url: string) => {
    setAnchorPages(null);
    navigate(
      `${url}?student=${studentId}&name=${
        selectedStudent?.name || receivedName
      }&category=${category}`
    );
  };

  const handleActionClick = (action: string, data: BreadcrumbData) => {
    setDialogTitle(`${action} ${data.name}'s Submission`);
    setDialogContent(
      action === "Download Submission" ? (
        <DownloadDialog setOpenDialog={setOpenDialog} id={Number(data.id)} />
      ) : (
        <UploadDialog setOpenDialog={setOpenDialog} id={Number(data.id)} />
      )
    );
    setOpenDialog(true);
  };

  const isActionDisabled = !selectedStudent || submissions.length === 0;

  const breadcrumbs = [
    <Link
      key="supervisees"
      underline="hover"
      color="inherit"
      onClick={handleClick}
      sx={{ cursor: "pointer" }}
    >
      <Typography
        fontSize="1rem"
        color="primary"
        sx={{
          display: "flex",
          alignItems: "center",
          mr: "0.25rem",
        }}
      >
        <SubdirectoryArrowRightIcon sx={{ mb: 1 }} />
        {category === "supervisor" ? "Supervisees" : "Evaluatees"}
      </Typography>
    </Link>,
    <StyledBreadcrumb
      key="page"
      label={currentPage}
      deleteIcon={<ExpandMoreIcon color="primary" />}
      onDelete={handleChangePages}
    />,
    <Autocomplete
      key="student"
      options={names}
      getOptionLabel={(option) => option.name}
      value={selectedSubmission ?? undefined}
      onChange={(_, value) => handleSelectStudent(value)}
      disableClearable
      size="small"
      popupIcon={<ExpandMoreIcon />}
      disabled={isLoading || names.length === 0}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          placeholder={isLoading ? "Loading students..." : "Select student"}
          sx={{
            minWidth: 150,
            "& .MuiInput-underline:before": { borderBottom: "none" },
            "& .MuiInput-underline:after": { borderBottom: "none" },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              borderBottom: "none",
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {option.name}
        </li>
      )}
      sx={{ display: "inline-flex", alignItems: "center" }}
    />,
    ...(location.pathname === "/viewing"
      ? [
          <Autocomplete
            key="submission"
            options={submissions}
            getOptionLabel={(option) => option.name}
            value={selectedSubmission ?? undefined}
            onChange={(_, value) => handleSelectSubmission(value)}
            disableClearable
            size="small"
            popupIcon={<ExpandMoreIcon />}
            disabled={isLoading || submissions.length === 0 || !selectedStudent}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                placeholder={
                  isLoading ? "Loading submissions..." : "Select submission"
                }
                sx={{
                  minWidth: 150,
                  "& .MuiInput-underline:before": { borderBottom: "none" },
                  "& .MuiInput-underline:after": { borderBottom: "none" },
                  "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                    borderBottom: "none",
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.name}
              </li>
            )}
            sx={{ display: "inline-flex", alignItems: "center" }}
          />,
        ]
      : []),
  ];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: "10px",
          pl: "10px",
          backgroundColor: "background.paper",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          width: "99%",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            pr: 2,
          }}
        >
          <Breadcrumbs
            separator={<ArrowRightIcon color="primary" />}
            aria-label="breadcrumb"
            sx={{
              "& .MuiBreadcrumbs-ol": {
                flexWrap: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          >
            {breadcrumbs}
          </Breadcrumbs>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Tooltip title="Download Submission" placement="top">
              <IconButton
                disabled={isActionDisabled}
                onClick={() =>
                  selectedStudent &&
                  handleActionClick("Download Submission", selectedStudent)
                }
                color="primary"
                size="small"
                sx={{
                  border: "1px solid",
                  borderRadius: "50%",
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Upload Feedback" placement="top">
              <IconButton
                disabled={isActionDisabled}
                onClick={() =>
                  selectedStudent &&
                  handleActionClick("Upload Submission", selectedStudent)
                }
                color="primary"
                size="small"
                sx={{
                  border: "1px solid",
                  borderRadius: "50%",
                }}
              >
                <FileUploadIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Divider orientation="vertical" flexItem />
          {infoLoading ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Loading info...
            </Typography>
          ) : breadcrumbInfo && selectedStudent ? (
            <>
              <Tooltip title="Student ID" placement="top">
                <Chip
                  icon={<SchoolIcon />}
                  label={`ID: ${breadcrumbInfo.student_id}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ textTransform: "capitalize", p: "5px" }}
                />
              </Tooltip>
              {breadcrumbInfo.course && (
                <Tooltip title="Course" placement="top">
                  <Chip
                    icon={<MenuBookIcon />}
                    label={breadcrumbInfo.course}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ textTransform: "capitalize", p: "5px" }}
                  />
                </Tooltip>
              )}
              {breadcrumbInfo.topic && (
                <Tooltip title="Topic" placement="top">
                  <Chip
                    icon={<TopicIcon />}
                    label={breadcrumbInfo.topic}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ textTransform: "capitalize", p: "5px" }}
                  />
                </Tooltip>
              )}
              {breadcrumbInfo.mode && (
                <Tooltip title="Mode" placement="top">
                  <Chip
                    icon={<BadgeIcon />}
                    label={breadcrumbInfo.mode}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ textTransform: "capitalize", p: "5px" }}
                  />
                </Tooltip>
              )}
            </>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              No student info available
            </Typography>
          )}
        </Box>
        <Menu
          anchorEl={anchorPages}
          open={Boolean(anchorPages)}
          onClose={handleClosePages}
        >
          {pages.map((item) => (
            <MenuItem key={item.url} onClick={() => handleSelectPage(item.url)}>
              {item.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        {dialogContent}
      </Dialog>
    </>
  );
}
