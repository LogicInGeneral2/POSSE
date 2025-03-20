import { Divider, Typography } from "@mui/material";
import { CustomTabs } from "./tabs";
import course_outline_tabs_data from "../../modals/course_outline";

export const CourseOulinePage = () => {
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
        <CustomTabs tabsData={course_outline_tabs_data} />
      </div>
    </>
  );
};
