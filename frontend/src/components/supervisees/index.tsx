import { Box, Divider, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import DataTable from "./table";
import { SuperviseeSubmission } from "../../services/types";
import { getEvaluatees, getSupervisees } from "../../services";
import ErrorNotice from "../commons/error";
import LoadingSpinner from "../commons/loading";
import { useSearchParams } from "react-router";

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
      id={`students-tabpanel-${index}`}
      aria-labelledby={`students-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `students-tab-${index}`,
    "aria-controls": `students-tabpanel-${index}`,
  };
}

export const SuperviseesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = React.useState(0);
  const [evaluatees, setEvaluatees] = useState<SuperviseeSubmission[]>([]);
  const [supervisees, setSupervisees] = useState<SuperviseeSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabQuery = searchParams.get("tab");

  const fetchSupervisees = async () => {
    try {
      const data = await getSupervisees();
      setSupervisees(data.data);
    } catch (error) {
      console.error("Error fetching supervisees:", error);
    }
  };

  const fetchEvaluatees = async () => {
    try {
      const data = await getEvaluatees();
      setEvaluatees(data.data);
    } catch (error) {
      console.error("Error fetching evaluatees:", error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    if (value === 0) {
      await fetchSupervisees();
    } else {
      await fetchEvaluatees();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await Promise.all([fetchSupervisees(), fetchEvaluatees()]);
      setIsLoading(false);
    };
    initialFetch();
  }, []);

  useEffect(() => {
    setValue(tabQuery === "evaluatees" ? 1 : 0);
  }, [tabQuery]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setSearchParams({ tab: newValue === 1 ? "evaluatees" : "supervisees" });
  };

  if (!evaluatees || !supervisees) {
    return <ErrorNotice />;
  }

  return (
    <div style={{ height: "100%" }}>
      <Typography fontSize={"3rem"} color="primary" sx={{ fontWeight: "bold" }}>
        Submissions & Grading
      </Typography>
      <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
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
          <DataTable
            data={supervisees}
            category="supervisor"
            onRefresh={handleRefresh}
          />
        )}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            data={evaluatees}
            category="examiner"
            onRefresh={handleRefresh}
          />
        )}
      </CustomTabPanel>
    </div>
  );
};
