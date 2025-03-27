import React from "react";
import { emphasize, styled } from "@mui/system";
import {
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from "@mui/material";

// Custom Styled Select Component
const StyledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  height: theme.spacing(4), // Increased height for better UX
  color: theme.palette.text.primary,
  fontWeight: theme.typography?.,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  "&:hover, &:focus": {
    backgroundColor: emphasize(theme.palette.grey[100], 0.06),
  },
  "&.Mui-focused": {
    backgroundColor: emphasize(theme.palette.grey[100], 0.12),
    boxShadow: theme.shadows[1],
  },
  // Dark mode styles
  ...(theme.palette.mode === "dark" && {
    backgroundColor: theme.palette.grey[800],
    "&:hover, &:focus": {
      backgroundColor: emphasize(theme.palette.grey[800], 0.06),
    },
    "&.Mui-focused": {
      backgroundColor: emphasize(theme.palette.grey[800], 0.12),
    },
  }),
}));

// Component with TypeScript Props
export const CustomSelect: React.FC = () => {
  const [age, setAge] = React.useState<string>("");

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }}>
      <StyledSelect
        value={age}
        onChange={handleChange}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </StyledSelect>
      <FormHelperText>Without label</FormHelperText>
    </FormControl>
  );
};
