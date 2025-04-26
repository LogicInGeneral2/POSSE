import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { fabric } from "fabric";
import { useButtons } from "./canvas";
import SideBar from "./sidebar";
import { Box, Button, Typography } from "@mui/material";
import Loader from "./loader";
import { getLatestUserSubmission, getUserSubmission } from "../../services";

interface FileUploadProps {
  student: string; // Changed to string to match ViewingPage
  submission?: number;
}

export default function FileUpload({ student, submission }: FileUploadProps) {
  const contextValues = useButtons();
  const [source, setSource] = useState<{ file: string } | null>(null);
  const [docIsLoading, setDocIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSource = async () => {
      setDocIsLoading(true);
      setError(null);
      setSource(null); // Reset source
      contextValues.setEdits({}); // Reset edits
      contextValues.setCanvas(null); // Reset canvas
      contextValues.setCurrPage(1); // Reset page
      contextValues.setNumPages(0); // Reset page count

      try {
        const studentId = Number(student);
        if (isNaN(studentId)) {
          throw new Error("Invalid student ID");
        }

        let data;
        if (submission) {
          console.log(
            `Fetching submission ${submission} for student ${studentId}`
          );
          data = await getUserSubmission(studentId, submission);
        } else {
          console.log(`Fetching latest submission for student ${studentId}`);
          data = await getLatestUserSubmission(studentId);
        }

        if (!data?.data?.file) {
          throw new Error("No valid file data returned");
        }

        setSource(data.data);
      } catch (error) {
        console.error("Error fetching submission:", error);
        setError("Failed to load submission. Please try again.");
      } finally {
        setDocIsLoading(false);
      }
    };
    fetchSource();
  }, [student, submission]);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    if (source?.file) {
      console.log("Setting file in context:", source.file);
      contextValues.setFile(source.file);
      setDocIsLoading(true);
    }
  }, [source, contextValues]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log("Document loaded with", numPages, "pages");
    contextValues.setEdits({});
    contextValues.setNumPages(numPages);
    contextValues.setCurrPage(1);

    // Get the first page size
    pdfjs.getDocument(source!.file).promise.then((pdf) => {
      pdf.getPage(1).then((page) => {
        const viewport = page.getViewport({ scale: 1 });
        const pageWidth = viewport.width;
        const pageHeight = viewport.height;

        console.log(
          "Initializing canvas with dimensions:",
          pageWidth,
          pageHeight
        );
        contextValues.setCanvas(initCanvas(pageWidth, pageHeight));
        setTimeout(() => setDocIsLoading(false), 1000); // Reduced timeout for faster feedback
      });
    });
  }

  function changePage(offset: number) {
    const page = contextValues.currPage;
    if (contextValues.canvas) {
      contextValues.edits[page] = contextValues.canvas.toObject();
      contextValues.setEdits(contextValues.edits);
      contextValues.setCurrPage(page + offset);
      contextValues.canvas.clear();
      if (contextValues.edits[page + offset]) {
        contextValues.canvas.loadFromJSON(contextValues.edits[page + offset]);
      }
      contextValues.canvas.renderAll();
    }
  }

  const initCanvas = (width: number, height: number): fabric.Canvas => {
    return new fabric.Canvas("canvas", {
      isDrawingMode: false,
      height: height,
      width: width,
      backgroundColor: "rgba(0,0,0,0)",
    });
  };

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{ textAlign: "center", fontWeight: "bold", color: "error.main" }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  if (!source) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "text.secondary",
          }}
        >
          No data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {source.file && <SideBar />}
      {source.file ? (
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
            {docIsLoading && <Loader />}
            <Document file={source.file} onLoadSuccess={onDocumentLoadSuccess}>
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
                backgroundColor: "primary.main",
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
