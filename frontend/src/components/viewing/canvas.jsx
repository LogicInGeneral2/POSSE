import React, { useRef } from "react";
import { fabric } from "fabric";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const funButtons = React.createContext();

export const useButtons = () => {
  return React.useContext(funButtons);
};

export const CanvasProvider = ({ children }) => {
  const [numPages, setNumPages] = React.useState(null);
  const [currPage, setCurrPage] = React.useState(1);
  const [selectedFile, setFile] = React.useState(null);
  const [color, setColor] = React.useState("#000");
  const [borderColor, setBorderColor] = React.useState("#f4a261");
  const [strokeWidth, setStrokeWidth] = React.useState(1);
  const [canvas, setCanvas] = React.useState("");
  const [isExporting, setExporting] = React.useState(false);
  const [hideCanvas, setHiddenCanvas] = React.useState(false);
  const [pageCanvases, setPageCanvases] = React.useState({}); // Stores canvas state per page

  const exportPage = useRef(null);
  const [exportPages, setExportPages] = React.useState([]);
  // canvas edits
  const [edits, setEdits] = React.useState({});
  // uploaded image

  React.useEffect(() => {
    if (document.getElementById("canvasWrapper"))
      document.getElementById("canvasWrapper").style.visibility =
        document.getElementById("canvasWrapper").style.visibility == "hidden"
          ? "visible"
          : "hidden";
  }, [hideCanvas]);

  React.useEffect(() => {
    if (canvas != "") {
      var activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.set("fill", color);
        canvas.renderAll();
      }
    }
  }, [color]);

  React.useEffect(() => {
    if (canvas.isDrawingMode) canvas.freeDrawingBrush.color = borderColor;
    if (canvas != "") {
      var activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.set("stroke", borderColor);
        canvas.renderAll();
      }
    }
  }, [borderColor]);

  React.useEffect(() => {
    if (canvas.isDrawingMode) canvas.freeDrawingBrush.width = strokeWidth;
    if (canvas != "") {
      var activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.set("strokeWidth", strokeWidth);
        canvas.renderAll();
      }
    }
  }, [strokeWidth]);

  const downloadPage = () => {
    setExporting(true);
    const doc = document.querySelector("#singlePageExport");
  
    if (!doc) {
      console.error("Error: Element #singlePageExport not found.");
      setExporting(false);
      return;
    }
  
    html2canvas(doc, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
  
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("marked_submission.pdf");
      setExporting(false);
    });
  };

  const addImage = (e, canvi) => {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function (f) {
      var data = f.target.result;
      fabric.Image.fromURL(data, function (img) {
        img.scaleToWidth(300);
        canvi.add(img).renderAll();
        var dataURL = canvi.toDataURL({ format: "png", quality: 0.8 });
      });
    };
    reader.readAsDataURL(file);
    canvi.isDrawingMode = false;
  };

  const addNote = (canvi) => {
    fabric.Image.fromURL(
      `./note/note${(Math.floor(Math.random() * 10) % 4) + 1}.png`,
      function (img) {
        img.scaleToWidth(100);
        canvi.add(img).renderAll();
        var dataURL = canvi.toDataURL({ format: "png", quality: 0.8 });
      }
    );
    canvi.isDrawingMode = false;
  };

  const deleteBtn = () => {
    const activeObjects = canvas.getActiveObjects(); 
  
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        canvas.remove(obj); 
      });
  
      canvas.discardActiveObject(); 
      canvas.requestRenderAll(); // Refresh canvas
    }
  };

  // add a rectangle
  const addRect = (canvi) => {
    const rect = new fabric.Rect({
      height: 180,
      width: 200,
      fill: color,
      stroke: borderColor,
      strokeWidth: strokeWidth,
      cornerStyle: "circle",
      editable: true,
    });
    canvi.add(rect);
    canvi.renderAll();
    canvi.isDrawingMode = false;
  };

  const addCircle = (canvi) => {
    const rect = new fabric.Circle({
      radius: 100,
      fill: color,
      cornerStyle: "circle",
      editable: true,
      stroke: borderColor,
      strokeWidth: 2,
    });
    canvi.add(rect);
    canvi.renderAll();
    canvi.isDrawingMode = false;
  };

  const addHighlight = (canvi) => {
    const rect = new fabric.Rect({
      height: 20,
      width: 400,
      fill: color,
      opacity: 0.4,
      cornerStyle: "circle",
      editable: true,
    });
    canvi.add(rect);
    canvi.renderAll();
    canvi.isDrawingMode = false;
  };

  const addText = (canvi) => {
    const text = new fabric.Textbox("Type Here ...", {
      editable: true,
    });
    text.set({ fill: color, fontFamily: "Times New Roman" });
    canvi.add(text);
    canvi.renderAll();
    canvi.isDrawingMode = false;
  };

  const toggleDraw = (canvi) => {
    canvi.isDrawingMode = !canvi.isDrawingMode;
    var brush = canvas.freeDrawingBrush;
    brush.color = borderColor;
    brush.strokeWidth = strokeWidth;
  };

  const exportPdf = async () => {
    setExporting(true);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  
    let pageIndex = 1; // Start from the first page
    const totalPages = numPages; // Total number of pages in the document
  
    const exportNextPage = async () => {
      if (pageIndex > totalPages) {
        pdf.save("marked_submission.pdf"); // Save the final PDF file
        setExporting(false);
        return;
      }
  
      // Change to the correct page before exporting
      setCurrPage(pageIndex); // Ensure this updates your displayed page
      await new Promise((resolve) => setTimeout(resolve, 500)); // Allow time for UI to update
  
      if (edits[pageIndex]) {
        canvas.loadFromJSON(edits[pageIndex], () => {
          canvas.renderAll();
  
          setTimeout(() => {
            const docElement = document.querySelector("#singlePageExport");
            if (!docElement) {
              console.error("Error: Element #singlePageExport not found.");
              setExporting(false);
              return;
            }
  
            html2canvas(docElement, { scale: 2, useCORS: true }).then((canvas) => {
              const imgData = canvas.toDataURL("image/png");
              const imgWidth = 210;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
              if (pageIndex > 1) {
                pdf.addPage(); // Add new page after the first
              }
              pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  
              pageIndex += 1; // Move to the next page
              exportNextPage(); // Recursively export the next page
            });
          }, 600); // Delay to ensure rendering
        });
      } else {
        pageIndex += 1;
        exportNextPage();
      }
    };
  
    exportNextPage(); // Start exporting pages
  };
  
  return (
    <funButtons.Provider
      value={{
        canvas,
        setCanvas,
        addRect,
        addCircle,
        addText,
        addImage,
        numPages,
        setNumPages,
        currPage,
        setCurrPage,
        selectedFile,
        setFile,
        addHighlight,
        toggleDraw,
        color,
        setColor,
        edits,
        setEdits,
        addNote,
        deleteBtn,
        exportPage,
        exportPdf,
        downloadPage,
        isExporting,
        borderColor,
        setBorderColor,
        strokeWidth,
        setStrokeWidth,
        hideCanvas,
        setHiddenCanvas,
      }}
    >
      {children}
    </funButtons.Provider>
  );
};
