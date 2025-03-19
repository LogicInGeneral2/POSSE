import { Divider, Typography, Tabs, Tab, Box } from "@mui/material";
import React, { useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
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

export const CourseOulinePage = () => {
  const [value, setValue] = useState(0);

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
          Course Outline
        </Typography>

        <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              textColor="primary"
              indicatorColor="secondary"
              aria-label="co tabs"
            >
              <Tab label="Learning Outcome" {...a11yProps(0)} />
              <Tab label="Assessment Distribution" {...a11yProps(1)} />
              <Tab label="Assessment Breakdown" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <iframe
              src="../../../data/CO.pdf"
              width="100%"
              style={{ border: "none", height: "calc(100vh - 320px)" }}
            />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            Item Two
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            Item Three
          </CustomTabPanel>
        </Box>
      </div>
    </>
  );
};
