import { Tabs, Tab, Box } from "@mui/material";
import React, { useState } from "react";
import { CourseOutlineTabs } from "../../services/types";

interface CourseOutlinePageProps {
  tabsData: CourseOutlineTabs[];
}

function CustomTabPanel({
  value,
  index,
  fileSrc,
}: {
  value: number;
  index: number;
  fileSrc: string;
}) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <iframe
            src={fileSrc}
            width="100%"
            style={{
              border: "none",
              height: "calc(100vh - 320px)",
              borderRadius: "8px",
            }}
          />
        </Box>
      )}
    </div>
  );
}

export function CustomTabs({ tabsData }: CourseOutlinePageProps) {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="secondary"
          aria-label="course outline tabs"
        >
          {tabsData.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              id={`simple-tab-${index}`}
              aria-controls={`simple-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>
      {tabsData.map((tab, index) => (
        <CustomTabPanel
          key={index}
          value={value}
          index={index}
          fileSrc={tab.items}
        />
      ))}
    </Box>
  );
}
