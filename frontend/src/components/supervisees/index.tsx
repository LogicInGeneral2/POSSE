import { Box, Divider, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import DataTable from "./table";
import { SuperviseeSubmission } from "../../services/types";
import { getEvaluatees, getSupervisees } from "../../services";
import ErrorNotice from "../commons/error";
import LoadingSpinner from "../commons/loading";

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

export const SuperviseesPage = () => {
  const [value, setValue] = React.useState(0);
  const [evaluatees, setEvaluatees] = useState<SuperviseeSubmission[]>([]);
  const [supervisees, setSupervisees] = useState<SuperviseeSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (!evaluatees || !supervisees) {
    return <ErrorNotice />;
  }

  useEffect(() => {
    const fetchSupervisees = async () => {
      try {
        const data = await getSupervisees();
        setSupervisees(data);
      } catch (error) {
        console.error("Error fetching supervisees:", error);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchEvaluatees = async () => {
      try {
        const data = await getEvaluatees();
        setEvaluatees(data);
      } catch (error) {
        console.error("Error fetching supervisees:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSupervisees();
    fetchEvaluatees();
  }, []);

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
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <DataTable data={supervisees} category="supervisor" />
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <DataTable data={evaluatees} category="examiner" />
          )}
        </CustomTabPanel>
      </div>
    </>
  );
};
