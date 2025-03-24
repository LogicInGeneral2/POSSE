import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { fabric } from "fabric";
import { useButtons } from "./canvas";
import SideBar from "./sidebar";
import { Box, Button, Typography } from "@mui/material";
import Loader from "./loader";

interface FileUploadProps {
  src: string | null;
}

export default function FileUpload({ src }: FileUploadProps) {
  const contextValues = useButtons();
  const [docIsLoading, setDocIsLoading] = useState<boolean>(true);

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

    // Get the first page size
    pdfjs.getDocument(src as string).promise.then((pdf) => {
      pdf.getPage(1).then((page) => {
        const viewport = page.getViewport({ scale: 1 });
        const pageWidth = viewport.width;
        const pageHeight = viewport.height;

        contextValues.setCanvas(initCanvas(pageWidth, pageHeight));
        setTimeout(() => setDocIsLoading(false), 2000);
      });
    });
  }

  function changePage(offset: number) {
    const page = contextValues.currPage;
    contextValues.edits[page] = contextValues.canvas.toObject();
    contextValues.setEdits(contextValues.edits);
    contextValues.setCurrPage(page + offset);
    contextValues.canvas.clear();
    if (contextValues.edits[page + offset]) {
      contextValues.canvas.loadFromJSON(contextValues.edits[page + offset]);
    }
    contextValues.canvas.renderAll();
  }

  const initCanvas = (width: number, height: number): fabric.Canvas => {
    return new fabric.Canvas("canvas", {
      isDrawingMode: false,
      height: height,
      width: width,
      backgroundColor: "rgba(0,0,0,0)",
    });
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {src && <SideBar />}
      {src ? (
        <Box
          sx={{
            width: "100%",
            py: 8,
            backgroundColor: "white",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            id="singlePageExport"
            style={{
              display: "flex",
              justifyContent: "center",
              width: contextValues.canvas?.width,
              height: contextValues.canvas?.height,
            }}
          >
            {docIsLoading && (
              <>
                <Loader />
              </>
            )}
            <Document file={src} onLoadSuccess={onDocumentLoadSuccess}>
              <div
                id="canvasWrapper"
                style={{
                  visibility: "visible",
                  zIndex: 9,
                  padding: 4,
                  position: "absolute",
                }}
              >
                <canvas id="canvas" />
              </div>
              <Box
                sx={{
                  p: 4,
                  boxShadow: "0px 0px 8px rgba(0,0,0,0.1)",
                  border: "1px solid #ccc",
                }}
              >
                <Page
                  pageNumber={contextValues.currPage}
                  width={contextValues.canvas?.width || 595}
                  height={contextValues.canvas?.height || 842}
                />
              </Box>
            </Document>
          </div>
          <Box
            sx={{
              position: "fixed",
              bottom: 10,
              display: "flex",
              justifyContent: "center",
              width: "100%",
              gap: 2,
              zIndex: 50,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={!(contextValues.currPage > 1)}
              onClick={() => changePage(-1)}
            >
              {"<"}
            </Button>
            <Box
              sx={{
                px: 4,
                py: 2,
                backgroundColor: "#58041D",
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
                size="small"
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
