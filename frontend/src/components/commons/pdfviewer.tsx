import "./pdfworker";
import { Document, Page, DocumentProps } from "react-pdf";
import { useState } from "react";
import { useContainerWidth } from "./containerWidth";
import { Box, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface PDFViewerProps {
  src: string;
  defaultZoom?: number;
  customHeight?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  src,
  defaultZoom = 1,
  customHeight = "30vh",
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(defaultZoom);
  const { ref, width: containerWidth } = useContainerWidth();
  const Height = customHeight;

  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(src);

  const onLoadSuccess: DocumentProps["onLoadSuccess"] = ({ numPages }) => {
    setNumPages(numPages || 0);
  };

  const pageWidth = containerWidth ? containerWidth * zoom : 600;
  const imageWidth = containerWidth ? containerWidth * zoom : 600;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  return (
    <div style={{ position: "relative" }}>
      {/* Zoom Buttons */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        <IconButton
          onClick={handleZoomOut}
          size="small"
          sx={{ background: "primary.main", border: "1px solid", mr: 1 }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={handleZoomIn}
          size="small"
          sx={{ background: "primary.main", border: "1px solid" }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </div>

      <Box
        ref={ref}
        sx={{
          width: "100%",
          maxHeight: Height,
          overflowY: "auto",
          border: "1px solid",
          justifyContent: "center",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {isImage ? (
          <img
            src={src}
            alt="Uploaded file"
            style={{
              width: `${imageWidth}px`,
              height: "auto",
              objectFit: "contain",
            }}
          />
        ) : (
          <Document
            file={src}
            onLoadSuccess={onLoadSuccess}
            loading={<div style={{ padding: "10px" }}>Loading PDF...</div>}
            error={
              <div style={{ padding: "10px", color: "red" }}>
                Failed to load PDF.
              </div>
            }
          >
            {Array.from({ length: numPages }, (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={pageWidth}
              />
            ))}
          </Document>
        )}
      </Box>
    </div>
  );
};

export default PDFViewer;
