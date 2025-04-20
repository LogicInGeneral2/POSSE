import { useEffect, useState } from "react";
import { useButtons } from "./canvas";
import { Divider, Paper, Popover, Slider, Tooltip } from "@mui/material";
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
  StraightenRounded,
} from "@mui/icons-material";
import Loader from "./loader";

export default function SideBar() {
  const contextValues = useButtons();

  useEffect(() => {
    const handleKeyDown = (event: { key: string }) => {
      if (event.key === "Delete") {
        contextValues.deleteBtn();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextValues]);

  const [openColor, setOpenColor] = useState(null);
  const [openBorderColor, setOpenBorderColor] = useState(null);
  const [openStroke, setOpenStroke] = useState(null);
  const [openHighlightSize, setOpenHighlightSize] = useState(null);

  return (
    <div>
      {contextValues.isExporting ? (
        <Loader />
      ) : (
        <div
          style={{
            position: "fixed",
            zIndex: 50,
            top: "45%",
            right: 10,
            height: "15vh",
            width: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              padding: "8px",
              textAlign: "center",
              minWidth: "1vw",
              gap: "8px",
              border: "1px solid secondary.main",
              backgroundColor: "primary.main",
              color: "black",
              borderRadius: "8px",
              boxShadow: "0px 0px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Tooltip title="Square" placement="left">
              <div>
                <SquareRounded
                  sx={{ color: "secondary.main" }}
                  style={{ cursor: "pointer", fontSize: "1.3rem" }}
                  onClick={() => contextValues.addRect(contextValues.canvas)}
                />
              </div>
            </Tooltip>

            <Tooltip title="Circle" placement="left">
              <div>
                <CircleRounded
                  sx={{ color: "secondary.main" }}
                  style={{ cursor: "pointer" }}
                  onClick={() => contextValues.addCircle(contextValues.canvas)}
                />
              </div>
            </Tooltip>

            <Tooltip title="Add Image" placement="left">
              <div>
                <label htmlFor="img-input">
                  <AddPhotoAlternateRounded
                    sx={{ color: "secondary.main" }}
                    style={{ cursor: "pointer", fontSize: "1.5rem" }}
                  />
                </label>
                <input
                  type="file"
                  id="img-input"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    contextValues.addImage(e, contextValues.canvas)
                  }
                />
              </div>
            </Tooltip>

            <Tooltip title="TextBox" placement="left">
              <div>
                <TextFieldsRounded
                  sx={{ color: "secondary.main" }}
                  style={{ cursor: "pointer", fontSize: "1.5rem" }}
                  onClick={() => contextValues.addText(contextValues.canvas)}
                />
              </div>
            </Tooltip>

            <Divider flexItem color="secondary.main" />

            <Tooltip title="Draw" placement="left">
              <div>
                <ModeEditRounded
                  sx={{
                    color: contextValues.isDrawingMode
                      ? "secondary.main"
                      : "gray",
                  }}
                  style={{ cursor: "pointer", fontSize: "1.5rem" }}
                  onClick={() => contextValues.toggleDraw(contextValues.canvas)}
                />
              </div>
            </Tooltip>

            <Tooltip title="Highlight Mode" placement="left">
              <div>
                <BrushRounded
                  sx={{
                    color: contextValues.isHighlightMode
                      ? "secondary.main"
                      : "gray",
                  }}
                  style={{ cursor: "pointer", fontSize: "1.5rem" }}
                  onClick={() =>
                    contextValues.setIsHighlightMode((prev: any) => !prev)
                  }
                />
              </div>
            </Tooltip>

            <Divider flexItem color="secondary.main" />

            <Tooltip title="Delete Selected" placement="left">
              <div>
                <DeleteForeverRounded
                  sx={{ color: "secondary.main" }}
                  style={{ cursor: "pointer", fontSize: "1.5rem" }}
                  onClick={() => contextValues.deleteBtn()}
                />
              </div>
            </Tooltip>

            <Tooltip title="Reset Page" placement="left">
              <div>
                <RestartAltRounded
                  sx={{ color: "secondary.main" }}
                  style={{ cursor: "pointer", fontSize: "1.5rem" }}
                  onClick={() => contextValues.canvas.clear()}
                />
              </div>
            </Tooltip>

            <Divider flexItem color="secondary.main" />

            <Tooltip title="Download Current Page" placement="left">
              <div>
                <SimCardDownloadOutlined
                  sx={{ color: "secondary.main" }}
                  style={{ cursor: "pointer", fontSize: "1.5rem" }}
                  onClick={() => contextValues.downloadPage()}
                />
              </div>
            </Tooltip>

            <Tooltip title="Download Whole PDF" placement="left">
              <div>
                <SaveAsRounded
                  sx={{ color: "secondary.main" }}
                  style={{ cursor: "pointer", fontSize: "1.5rem" }}
                  onClick={() => contextValues.exportPdf()}
                />
              </div>
            </Tooltip>

            <Divider flexItem color="secondary.main" />

            <Tooltip title="Border Color" placement="left">
              <div
                style={{
                  cursor: "pointer",
                  width: "1.6rem",
                  height: "1.6rem",
                  borderRadius: "50%",
                  border: `4px dotted ${contextValues.borderColor}`,
                }}
                onClick={(e) => setOpenBorderColor(e.currentTarget as any)}
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
                onChangeComplete={(col) =>
                  contextValues.setBorderColor(col.hex)
                }
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
                  border: `4px dotted secondary.main`,
                }}
                onClick={(e) => setOpenColor(e.currentTarget as any)}
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
                  sx={{ color: "secondary.main" }}
                  onClick={(e) => setOpenStroke(e.currentTarget as any)}
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
                  onChange={(_e, value) => contextValues.setStrokeWidth(value)}
                  valueLabelDisplay="auto"
                />
              </div>
            </Popover>

            {/* New Highlight Size Control */}
            <Tooltip title="Highlight Size" placement="left">
              <div style={{ cursor: "pointer" }}>
                <StraightenRounded
                  sx={{ color: "secondary.main" }}
                  onClick={(e) => setOpenHighlightSize(e.currentTarget as any)}
                />
              </div>
            </Tooltip>
            <Popover
              open={Boolean(openHighlightSize)}
              anchorEl={openHighlightSize}
              onClose={() => setOpenHighlightSize(null)}
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
                  minHeight: "12vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                  justifyContent: "center",
                  padding: "8px",
                  gap: "8px",
                }}
              >
                <div>Highlight Width</div>
                <Slider
                  aria-label="Highlight Width"
                  value={contextValues.highlightWidth}
                  step={10}
                  min={50}
                  max={800}
                  onChange={(_e, value) =>
                    contextValues.setHighlightWidth(value)
                  }
                  valueLabelDisplay="auto"
                />
                <div>Highlight Height</div>
                <Slider
                  aria-label="Highlight Height"
                  value={contextValues.highlightHeight}
                  step={5}
                  min={10}
                  max={100}
                  onChange={(_e, value) =>
                    contextValues.setHighlightHeight(value)
                  }
                  valueLabelDisplay="auto"
                />
              </div>
            </Popover>
          </Paper>
        </div>
      )}
    </div>
  );
}
