import { Box, Divider, Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import DataTable from "./table";
import supervisees from "../../../data/supervisees.json";
import evaluatees from "../../../data/evaluatees.json";
import { TabPanelProps } from "./superviseesType";

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const SuperviseesPage = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <div
        style={{
          height: "100%",
        }}
      >
        <Typography
          fontSize={"3rem"}
          color="secondary"
          sx={{ fontWeight: "bold" }}
        >
          Submissions & Grading
        </Typography>
        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />{" "}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange}>
            <Tab label="Supervisees" {...a11yProps(0)} />
            <Tab label="Evaluatees" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <DataTable data={supervisees} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <DataTable data={evaluatees} />
        </CustomTabPanel>
      </div>
    </>
  );
};
