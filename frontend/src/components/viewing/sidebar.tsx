import { useEffect, useState } from "react";
import { useButtons } from "./canvas";
import { Popover, Slider, Tooltip } from "@mui/material";
import { SketchPicker } from "react-color";
import {
  AddPhotoAlternateRounded,
  BorderAllRounded,
  SimCardDownloadOutlined,
  TextFieldsRounded,
  CircleRounded,
  SquareRounded,
  ModeEditRounded,
  SaveAsRounded,
  RestartAltRounded,
  DeleteForeverRounded,
  BrushRounded,
} from "@mui/icons-material";

export default function SideBar() {
  const contextValues = useButtons();

  // Handle Delete key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        contextValues.deleteBtn();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextValues]); // Ensure it updates when contextValues changes

  // State variables with proper types
  const [openColor, setOpenColor] = useState<HTMLElement | null>(null);
  const [openBorderColor, setOpenBorderColor] = useState<HTMLElement | null>(
    null
  );
  const [openStroke, setOpenStroke] = useState<HTMLElement | null>(null);

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 50,
        top: "50%",
        right: 10,
        height: "15vh",
        width: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          padding: "8px",
          textAlign: "center",
          minWidth: "1vw",
          gap: "8px",
          border: "1px solid #F8B628",
          backgroundColor: "#58041D",
          color: "black",
          borderRadius: "8px",
          boxShadow: "0px 0px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Tooltip title="Square" placement="left">
          <div>
            <SquareRounded
              sx={{ color: "#F8B628" }}
              style={{ cursor: "pointer", fontSize: "1.3rem" }}
              onClick={() => contextValues.addRect(contextValues.canvas)}
            />
          </div>
        </Tooltip>

        <Tooltip title="Circle" placement="left">
          <div>
            <CircleRounded
              sx={{ color: "#F8B628" }}
              style={{ cursor: "pointer" }}
              onClick={() => contextValues.addCircle(contextValues.canvas)}
            />
          </div>
        </Tooltip>

        <Tooltip title="TextBox" placement="left">
          <div>
            <TextFieldsRounded
              sx={{ color: "#F8B628" }}
              style={{ cursor: "pointer", fontSize: "1.5rem" }}
              onClick={() => contextValues.addText(contextValues.canvas)}
            />
          </div>
        </Tooltip>

        <Tooltip title="Add Image" placement="left">
          <div>
            <label htmlFor="img-input">
              <AddPhotoAlternateRounded
                sx={{ color: "#F8B628" }}
                style={{ cursor: "pointer", fontSize: "1.5rem" }}
              />
            </label>
            <input
              type="file"
              id="img-input"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => contextValues.addImage(e, contextValues.canvas)}
            />
          </div>
        </Tooltip>

        <Tooltip title="Draw" placement="left">
          <div>
            <ModeEditRounded
              sx={{ color: "#F8B628" }}
              style={{ cursor: "pointer", fontSize: "1.5rem" }}
              onClick={() => contextValues.toggleDraw(contextValues.canvas)}
            />
          </div>
        </Tooltip>

        <Tooltip title="Highlight" placement="left">
          <div>
            <BrushRounded
              sx={{ color: "#F8B628" }}
              style={{ cursor: "pointer", fontSize: "1.5rem" }}
              onClick={() => contextValues.addHighlight(contextValues.canvas)}
            />
          </div>
        </Tooltip>

        <Tooltip title="Delete Selected" placement="left">
          <div>
            <DeleteForeverRounded
              sx={{ color: "#F8B628" }}
              style={{ cursor: "pointer", fontSize: "1.5rem" }}
              onClick={() => contextValues.deleteBtn()}
            />
          </div>
        </Tooltip>

        <Tooltip title="Reset Page" placement="left">
          <div>
            <RestartAltRounded
              sx={{ color: "#F8B628" }}
              style={{ cursor: "pointer", fontSize: "1.5rem" }}
              onClick={() => contextValues.canvas.clear()}
            />
          </div>
        </Tooltip>

        <Tooltip title="Download Current Page" placement="left">
          <div>
            <SimCardDownloadOutlined
              sx={{ color: "#F8B628" }}
              style={{ cursor: "pointer", fontSize: "1.5rem" }}
              onClick={() => contextValues.downloadPage()}
            />
          </div>
        </Tooltip>

        <Tooltip title="Download Whole PDF" placement="left">
          <div>
            <SaveAsRounded
              sx={{ color: "#F8B628" }}
              className="md:text-[1.8rem] text-[1.5rem] cursor-pointer"
              onClick={() => {
                contextValues.edits[contextValues.currPage] =
                  contextValues.canvas.exportPdf();
              }}
            />
          </div>
        </Tooltip>

        <Tooltip title="Border Color" placement="left">
          <div
            style={{
              cursor: "pointer",
              width: "1.6rem",
              height: "1.6rem",
              borderRadius: "50%",
              border: `4px dotted ${contextValues.borderColor}`,
            }}
            onClick={(e) => setOpenBorderColor(e.currentTarget)}
          />
        </Tooltip>
        <Popover
          open={Boolean(openBorderColor)}
          anchorEl={openBorderColor}
          onClose={() => setOpenBorderColor(null)}
          anchorOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "right",
          }}
        >
          <SketchPicker
            color={contextValues.borderColor}
            onChangeComplete={(col) => contextValues.setBorderColor(col.hex)}
          />
        </Popover>

        <Tooltip title="Fill Color Picker" placement="left">
          <div
            style={{
              cursor: "pointer",
              width: "1.6rem",
              height: "1.6rem",
              borderRadius: "50%",
              backgroundColor: contextValues.color,
              border: `4px dotted #F8B628`,
            }}
            onClick={(e) => setOpenColor(e.currentTarget)}
          />
        </Tooltip>
        <Popover
          open={Boolean(openColor)}
          anchorEl={openColor}
          onClose={() => setOpenColor(null)}
          anchorOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "right",
          }}
        >
          <SketchPicker
            color={contextValues.color}
            onChangeComplete={(col) => contextValues.setColor(col.hex)}
          />
        </Popover>

        <Tooltip title="Stroke Width" placement="left">
          <div style={{ cursor: "pointer" }}>
            <BorderAllRounded
              sx={{ color: "#F8B628" }}
              onClick={(e) =>
                setOpenStroke(e.currentTarget as unknown as HTMLElement)
              }
            />
          </div>
        </Tooltip>
        <Popover
          open={Boolean(openStroke)}
          anchorEl={openStroke}
          onClose={() => setOpenStroke(null)}
          anchorOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "right",
          }}
        >
          <div
            style={{
              minWidth: "20vw",
              minHeight: "8vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              justifyContent: "center",
              padding: "8px",
              gap: "8px",
            }}
          >
            <div>Stroke Width</div>
            <Slider
              aria-label="Stroke Width"
              value={contextValues.strokeWidth}
              step={1}
              min={0}
              max={10}
              onChange={(_e, value) =>
                contextValues.setStrokeWidth(value as number)
              }
              valueLabelDisplay="auto"
            />
          </div>
        </Popover>
      </div>
    </div>
  );
}
