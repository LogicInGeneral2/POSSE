import {
  Breadcrumbs,
  Chip,
  emphasize,
  Link,
  Menu,
  MenuItem,
  styled,
  Typography,
} from "@mui/material";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { BreadCrumbData } from "../../services/types";
import "./style.css";
import { getStudents } from "../../services";

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor: "transparent",
  height: theme.spacing(3),
  color: theme.palette.secondary.main,
  fontSize: "1rem",
  fontWeight: theme.typography.fontWeightBold,
  "& .MuiChip-deleteIcon": {
    color: theme.palette.secondary.main,
  },
  "&:hover, &:focus": {
    backgroundColor: emphasize(theme.palette.primary.main, 0.06),
  },
  "&:active": {
    boxShadow: theme.shadows[1],
    backgroundColor: emphasize(theme.palette.primary.main, 0.12),
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
  const [data, setData] = useState<BreadCrumbData[]>([]);
  const [anchorStudents, setAnchorStudents] = useState<null | HTMLElement>(
    null
  );
  const [anchorPages, setAnchorPages] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudentName, setSelectedStudentName] = useState(receivedName);
  const [names, setNames] = useState<{ id: string; name: string }[]>([]);

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

  useEffect(() => {
    if (!isLoading) {
      setNames(getStudentsList(location.pathname));
    } else {
      setNames([]);
    }
  }, [data, location.pathname, isLoading]);

  useEffect(() => {
    if (studentId && names.length > 0) {
      const foundStudent = names.find((student) => student.id === studentId);
      if (foundStudent) {
        setSelectedStudentName(foundStudent.name);
      }
    }
  }, [studentId, names]);

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

  const handleChangeStudents = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorStudents(event.currentTarget);
  };

  const handleCloseStudents = () => {
    setAnchorStudents(null);
  };

  const handleSelectStudent = (id: string) => {
    setAnchorStudents(null);
    const selectedStudent = names.find((student) => student.id === id);
    if (selectedStudent) {
      setSelectedStudentName(selectedStudent.name);
      navigate(
        `${location.pathname}?student=${id}&name=${selectedStudent.name}&category=${category}`
      );
    }
  };

  const handleSelectPage = (url: string) => {
    setAnchorPages(null);
    navigate(
      `${url}?student=${studentId}&name=${selectedStudentName}&category=${category}`
    );
  };

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
        color="secondary"
        sx={{
          fontWeight: "bold",
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
      deleteIcon={<ExpandMoreIcon color="secondary" />}
      onDelete={handleChangePages}
    />,
    <StyledBreadcrumb
      key="student"
      label={selectedStudentName}
      deleteIcon={<ExpandMoreIcon color="secondary" />}
      onDelete={handleChangeStudents}
    />,
  ];

  return (
    <>
      <Breadcrumbs
        separator={<ArrowRightIcon color="secondary" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs}
      </Breadcrumbs>
      <Menu
        anchorEl={anchorStudents}
        open={Boolean(anchorStudents)}
        onClose={handleCloseStudents}
      >
        {isLoading ? (
          <MenuItem disabled>Loading students...</MenuItem>
        ) : names.length > 0 ? (
          names.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => handleSelectStudent(item.id)}
            >
              {item.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No students available</MenuItem>
        )}
      </Menu>
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
    </>
  );
}
