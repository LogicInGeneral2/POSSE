import { Divider, Typography } from "@mui/material";
import DocumentsList from "./lists";
import { useSearchParams } from "react-router";
import ErrorNotice from "../commons/error";

const allowedCategories: Record<string, string> = {
  marking_scheme: "Marking Scheme",
  lecture_notes: "Lecture Notes",
  samples: "Samples",
  templates: "Templates",
  forms: "Forms",
  other: "Other",
};

export const DocumentsPage = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  const displayName = category ? allowedCategories[category] : "Documents";

  const isValid = category ? category in allowedCategories : true;

  return (
    <div style={{ height: "100%" }}>
      {!isValid && (
        <>
          <Typography
            color="error"
            fontSize={"2rem"}
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            INVALID CATEGORY
          </Typography>
          <Divider
            sx={{ borderBottomWidth: 2, borderColor: "primary.main", mb: 2 }}
          />
          <ErrorNotice />
        </>
      )}
      {isValid && category && (
        <>
          <Typography
            fontSize={"3rem"}
            color="primary"
            sx={{ fontWeight: "bold" }}
          >
            {displayName}
          </Typography>
          <Divider sx={{ borderBottomWidth: 2, borderColor: "primary.main" }} />
          <DocumentsList category={category} />
        </>
      )}
    </div>
  );
};
