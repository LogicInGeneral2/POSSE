import { Divider } from "@mui/material";
import "./style.css";

export const Footer = () => {
  return (
    <footer className="trade-footer footer-absolute">
      <Divider sx={{ borderColor: "primary.main" }} />
      <p>© 2024 PSM ONLINE SYSTEM FOR SOFTWARE ENGINEERING</p>
    </footer>
  );
};
