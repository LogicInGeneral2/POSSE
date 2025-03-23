import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { fabric } from "fabric";
import { useButtons } from "./canvas";
import SideBar from "./sidebar";
import { MdClose } from "react-icons/md";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

interface FileUploadProps {
  src: string | null;
}

export default function FileUpload({ src }: FileUploadProps) {
  const contextValues = useButtons();
  const [docIsLoading, setDocIsLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({
    width: 595,
    height: 842,
  });

  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    if (src) {
      contextValues.setFile(src);
      setDocIsLoading(true);
    }
  }, [src]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    contextValues.setEdits({});
    contextValues.setNumPages(numPages);
    contextValues.setCurrPage(1);
    setTimeout(() => setDocIsLoading(false), 1000);
  }

  function onPageRenderSuccess({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) {
    setPageSize({ width, height });

    if (canvasRef.current) {
      canvasRef.current.dispose();
    }

    const newCanvas = new fabric.Canvas("canvas", {
      width,
      height,
      isDrawingMode: false,
      backgroundColor: "rgba(0,0,0,0)",
    });

    canvasRef.current = newCanvas;
    contextValues.setCanvas(newCanvas);

    if (contextValues.edits[contextValues.currPage]) {
      newCanvas.loadFromJSON(contextValues.edits[contextValues.currPage]);
    }
  }

  function changePage(offset: number) {
    const page = contextValues.currPage;
    contextValues.edits[page] = canvasRef.current?.toObject() || {};
    contextValues.setEdits(contextValues.edits);
    contextValues.setCurrPage(page + offset);

    if (canvasRef.current) {
      canvasRef.current.clear();
      if (contextValues.edits[page + offset]) {
        canvasRef.current.loadFromJSON(contextValues.edits[page + offset]);
      }
    }
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {src && <SideBar />}
      {src ? (
        <Box sx={{ width: "100%", py: 8, backgroundColor: "white" }}>
          {docIsLoading && (
            <>
              <Box
                sx={{
                  position: "fixed",
                  width: "100%",
                  height: "100%",
                  top: 0,
                  backgroundColor: "rgba(50,50,50,0.2)",
                  zIndex: 1001,
                  backdropFilter: "blur(5px)",
                }}
              />
              <Box
                sx={{
                  position: "fixed",
                  zIndex: 1100,
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  top: 0,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress color="primary" size={120} thickness={5} />
              </Box>
            </>
          )}
          <Box
            sx={{
              p: 1,
              zIndex: 1200,
              backgroundColor: "red",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              color: "white",
              position: "fixed",
              top: 200,
              right: 40,
              cursor: "pointer",
            }}
            onClick={() => contextValues.setFile(null)}
          >
            <MdClose size={25} />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Document file={src} onLoadSuccess={onDocumentLoadSuccess}>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                }}
              >
                <canvas
                  id="canvas"
                  style={{ width: pageSize.width, height: pageSize.height }}
                />
              </Box>
              <Box
                sx={{
                  p: 4,
                  boxShadow: "0px 0px 8px rgba(0,0,0,0.1)",
                  border: "1px solid #ccc",
                }}
              >
                <Page
                  pageNumber={contextValues.currPage}
                  width={pageSize.width}
                  height={pageSize.height}
                  onRenderSuccess={onPageRenderSuccess}
                />
              </Box>
            </Document>
          </Box>
          <Box
            sx={{
              position: "fixed",
              bottom: 2,
              display: "flex",
              justifyContent: "center",
              width: "100%",
              gap: 3,
              zIndex: 50,
            }}
          >
            {contextValues.currPage > 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => changePage(-1)}
              >
                {"<"}
              </Button>
            )}
            <Box
              sx={{
                px: 4,
                py: 2,
                backgroundColor: "#033f63",
                borderRadius: 1,
                color: "white",
              }}
            >
              Page {contextValues.currPage} of {contextValues.numPages}
            </Box>
            {contextValues.currPage < contextValues.numPages && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => changePage(1)}
              >
                {">"}
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        <Typography variant="h6" align="center" sx={{ py: 8 }}>
          No PDF file selected.
        </Typography>
      )}
    </Box>
  );
}
