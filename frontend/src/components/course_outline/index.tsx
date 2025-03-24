import { Box, Divider, Typography } from "@mui/material";
import { CustomTabs } from "./tabs";
import { useEffect, useState } from "react";
import { CourseOutlineTabs } from "../../services/types";
import { getCourseOutlines } from "../../services";
import ErrorNotice from "../commons/error";
import LoadingSpinner from "../commons/loading";

export const CourseOulinePage = () => {
  const [tabs, setTabs] = useState<CourseOutlineTabs[]>([]);
  const [isLoading, setIsloading] = useState(true);

  useEffect(() => {
    const fetchCourseOutlines = async () => {
      const data = await getCourseOutlines();
      console.log(data);
      setTabs(data);
      setIsloading(false);
    };
    fetchCourseOutlines();
  }, []);

  if (!tabs) {
    return <ErrorNotice />;
  }

  return (
    <>
      <div style={{ height: "100%" }}>
        {isLoading ? (
          <Box>
            <LoadingSpinner />
          </Box>
        ) : (
          <>
            <Typography
              fontSize={"3rem"}
              color="secondary"
              sx={{ fontWeight: "bold" }}
            >
              Course Outline
            </Typography>
            <Divider
              sx={{ borderBottomWidth: 2, borderColor: "primary.main" }}
            />
            <CustomTabs tabsData={tabs} />
          </>
        )}
      </div>
    </>
  );
};
