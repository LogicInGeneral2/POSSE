import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import InfoIcon from "@mui/icons-material/Info";
import FolderIcon from "@mui/icons-material/Folder";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useNavigate } from "react-router";
import logo from "../assets/icon.png";
import {
  BookRounded,
  ExpandLess,
  ExpandMore,
  GradeRounded,
  GradingRounded,
  Person3Rounded,
  SupervisedUserCircleRounded,
} from "@mui/icons-material";
import { Collapse, Menu, MenuItem, Tooltip } from "@mui/material";
import { useUser } from "../../context/UserContext";
import { useEffect } from "react";
import { getSelectionStatus } from "../services";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function NavigationBar() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const [status, setStatus] = React.useState<boolean | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const docsMenuOpen = Boolean(anchorEl);
  const documentCategories = ["forms", "templates", "samples", "lecture_notes"];
  const [docsListOpen, setDocsListOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      const data = await getSelectionStatus();
      setStatus(data.data);
    };
    fetchStatus();
  }, []);

  const handleDocsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleNavigateToCategory = (category: string) => {
    navigate(`/documents?category=${category}`);
    handleMenuClose();
  };

  const menuItems = [
    {
      text: "Home",
      icon: <HomeIcon sx={{ color: "primary.main" }} />,
      path: "/home",
      external: false,
    },
    {
      text: "Course Outline",
      icon: <InfoIcon sx={{ color: "primary.main" }} />,
      path: "/course_outline",
    },
    user?.role !== "student" && {
      text: "Submissions & Grading",
      icon: <GradingRounded sx={{ color: "primary.main" }} />,
      path: "/supervisees",
    },
    user?.role === "student" &&
      status === true && {
        text: "Supervisors",
        icon: <SupervisedUserCircleRounded sx={{ color: "primary.main" }} />,
        path: "/supervisors",
      },
    {
      text: "Documents",
      icon: <FolderIcon sx={{ color: "primary.main" }} />,
      path: "/documents",
      isDocuments: true,
    },
    user?.role === "student" && {
      text: "Submissions",
      icon: <DriveFolderUploadIcon sx={{ color: "primary.main" }} />,
      path: "/submissions",
    },
    user?.role === "student" && {
      text: "Log Books",
      icon: <BookRounded sx={{ color: "primary.main" }} />,
      path: "/logs",
    },
    {
      text: "Profile",
      icon: <Person3Rounded sx={{ color: "primary.main" }} />,
      path: "/profile",
    },
    user?.role === "course_coordinator" && {
      text: "POSSE Admin",
      icon: <AdminPanelSettingsIcon sx={{ color: "primary.main" }} />,
      path: "http://127.0.0.1:8000/admin",
      external: true,
    },
    user?.role === "course_coordinator" && {
      text: "Grades",
      icon: <GradeRounded sx={{ color: "primary.main" }} />,
      path: "/grades",
    },
    {
      text: "Logout",
      icon: <ExitToAppRoundedIcon sx={{ color: "primary.main" }} />,
      path: "/logout",
    },
  ].filter(Boolean);

  const renderDocumentsNav = () => {
    if (open) {
      return (
        <>
          <ListItemButton
            onClick={() => setDocsListOpen(!docsListOpen)}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                my: 0.5,
              }}
            >
              <FolderIcon sx={{ color: "primary.main" }} />
            </ListItemIcon>
            <ListItemText primary="Documents" />
            {docsListOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={docsListOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {documentCategories.map((category) => (
                <ListItemButton
                  key={category}
                  sx={{ pl: 4 }}
                  onClick={() => navigate(`/documents?category=${category}`)}
                >
                  <ListItemText
                    primary={
                      category.charAt(0).toUpperCase() +
                      category.slice(1).replace("_", " ")
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </>
      );
    } else {
      return (
        <>
          <ListItem disablePadding sx={{ display: "block" }}>
            <Tooltip title="Documents" placement="right" arrow>
              <ListItemButton
                onClick={handleDocsClick}
                sx={{
                  minHeight: 48,
                  justifyContent: "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: "center",
                  }}
                >
                  <FolderIcon sx={{ color: "primary.main" }} />
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <Menu
            anchorEl={anchorEl}
            open={docsMenuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {documentCategories.map((category) => (
              <MenuItem
                key={category}
                onClick={() => handleNavigateToCategory(category)}
              >
                {category.charAt(0).toUpperCase() +
                  category.slice(1).replace("_", " ")}
              </MenuItem>
            ))}
          </Menu>
        </>
      );
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        open={open}
        sx={{ backgroundColor: "base.main", color: "primary.main" }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 2,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>

          <img
            src={logo}
            alt="POSSE Logo"
            style={{ marginRight: 5, height: 50, width: 50 }}
          />

          <Typography variant="h6" noWrap component="div">
            POSSE
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{ backgroundColor: "secondary.main" }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon sx={{ color: "primary.main" }} />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map(
            (item) =>
              item && (
                <ListItem
                  key={item.text}
                  disablePadding
                  sx={{ display: "block", color: "primary.main" }}
                >
                  {item.isDocuments ? (
                    renderDocumentsNav()
                  ) : (
                    <Tooltip
                      title={item.text}
                      placement="right"
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
                      <ListItemButton
                        sx={{
                          minHeight: 48,
                          justifyContent: open ? "initial" : "center",
                          px: 2.5,
                        }}
                        onClick={() => {
                          if (item.external) {
                            window.open(item.path, "_blank");
                          } else {
                            navigate(item.path);
                          }
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : "auto",
                            justifyContent: "center",
                            my: 0.5,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          sx={{ opacity: open ? 1 : 0 }}
                        />
                      </ListItemButton>
                    </Tooltip>
                  )}
                </ListItem>
              )
          )}
        </List>
      </Drawer>
    </Box>
  );
}
