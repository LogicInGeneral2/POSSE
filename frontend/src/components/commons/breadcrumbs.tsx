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
import "./style.css";

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

interface Lists {
  id: number;
  name: string;
}

interface Navigations {
  url: string;
  name: string;
}

export default function Breadcrumb({
  receivedName,
  category,
  currentPage,
  lists,
}: {
  receivedName: string;
  category: string;
  currentPage: string;
  lists: Lists[];
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = new URLSearchParams(location.search).get("student");

  const [anchorStudents, setAnchorStudents] = useState<null | HTMLElement>(
    null
  );
  const [anchorPages, setAnchorPages] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [names] = useState<Lists[]>(lists);
  const [selectedStudentName, setSelectedStudentName] = useState(receivedName);

  const pages: Navigations[] = [
    { url: "/Grading", name: "Grading" },
    { url: "/Viewing", name: "Viewing" },
  ];

  useEffect(() => {
    const updateStudent = async () => {
      if (studentId) {
        const foundStudent = names.find(
          (student: { id: { toString: () => string } }) =>
            student.id.toString() === studentId
        );
        if (foundStudent) {
          setSelectedStudentName(foundStudent.name);
        }
      }

      setIsLoading(false);
    };
    updateStudent();
  }, [category, studentId]);

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

  const handleSelectStudent = (id: number) => {
    setAnchorStudents(null);
    const selectedStudent = names.find((student) => student.id === id);
    if (selectedStudent) {
      setSelectedStudentName(selectedStudent.name);
      navigate(
        `${location.pathname}?student=${id}&name=${selectedStudent.name}`
      );
    }
  };

  const handleSelectPage = (url: string) => {
    setAnchorPages(null);
    navigate(`${url}?student=${studentId}&name=${selectedStudentName}`);
  };

  const breadcrumbs = [
    <Link
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
      label={currentPage}
      deleteIcon={<ExpandMoreIcon color="secondary" />}
      onDelete={handleChangePages}
    />,
    <StyledBreadcrumb
      label={selectedStudentName}
      deleteIcon={<ExpandMoreIcon color="secondary" />}
      onDelete={handleChangeStudents}
    />,
  ];

  return (
    <>
      {!isLoading && (
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
            {names.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => handleSelectStudent(item.id)}
              >
                {item.name}
              </MenuItem>
            ))}
          </Menu>
          <Menu
            anchorEl={anchorPages}
            open={Boolean(anchorPages)}
            onClose={handleClosePages}
          >
            {pages.map((item) => (
              <MenuItem
                key={item.url}
                onClick={() => handleSelectPage(item.url)}
              >
                {item.name}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </>
  );
}
