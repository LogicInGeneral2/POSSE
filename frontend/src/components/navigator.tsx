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
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { useNavigate } from "react-router";
import logo from "../assets/icon.png";
import {
  BookRounded,
  GradingRounded,
  SupervisedUserCircleRounded,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
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

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      const data = await getSelectionStatus();
      setStatus(data.enabled);
    };
    fetchStatus();
  }, []);

  const menuItems = [
    {
      text: "Home",
      icon: <HomeIcon style={{ color: "#58041D" }} />,
      path: "/home",
      external: false,
    },
    {
      text: "Course Outline",
      icon: <InfoIcon style={{ color: "#58041D" }} />,
      path: "/course_outline",
    },
    user?.role === "supervisor" && {
      text: "Submissions & Grading",
      icon: <GradingRounded style={{ color: "#58041D" }} />,
      path: "/supervisees",
    },
    user?.role === "student" &&
      status === true && {
        text: "Supervisors",
        icon: <SupervisedUserCircleRounded style={{ color: "#58041D" }} />,
        path: "/supervisors",
      },
    {
      text: "Documents",
      icon: <FolderIcon style={{ color: "#58041D" }} />,
      path: "/documents",
    },
    user?.role === "student" && {
      text: "Submissions",
      icon: <DriveFolderUploadIcon style={{ color: "#58041D" }} />,
      path: "/submissions",
    },
    {
      text: "Log Books",
      icon: <BookRounded style={{ color: "#58041D" }} />,
      path: "/logs",
    },
    {
      text: "Profile",
      icon: <AccountBoxIcon style={{ color: "#58041D" }} />,
      path: "/profile",
    },
    {
      text: "Logout",
      icon: <ExitToAppRoundedIcon style={{ color: "#58041D" }} />,
      path: "/logout",
    },
  ].filter(Boolean);

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        open={open}
        sx={{ backgroundColor: "#E9DADD", color: "#58041D" }}
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
        sx={{ backgroundColor: "#E9DADD" }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon style={{ color: "#58041D" }} />
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
                  sx={{ display: "block", color: "#58041D" }}
                >
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
                          window.location.href = item.path;
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
                </ListItem>
              )
          )}
        </List>
      </Drawer>
    </Box>
  );
}
