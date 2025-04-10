// components/PDFViewer.tsx
import "./pdfworker";
import { Document, Page, DocumentProps } from "react-pdf";
import { useState } from "react";
import { useContainerWidth } from "./containerWidth";

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
  const { ref, width: containerWidth } = useContainerWidth();
  const zoom = defaultZoom;
  const Height = customHeight;

  const onLoadSuccess: DocumentProps["onLoadSuccess"] = ({ numPages }) => {
    setNumPages(numPages || 0);
  };

  const pageWidth = containerWidth ? containerWidth * zoom : 600;

  return (
    <div>
      <div
        ref={ref}
        style={{
          width: "100%",
          maxHeight: Height,
          overflowY: "auto",
          border: "1px solid #ccc",
          justifyContent: "center",
          display: "flex",
        }}
      >
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
      </div>
    </div>
  );
};

export default PDFViewer;
