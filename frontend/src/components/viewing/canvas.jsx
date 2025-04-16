import React, { useRef, useEffect, useState } from "react";
import { fabric } from "fabric";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const funButtons = React.createContext();

export const useButtons = () => {
  return React.useContext(funButtons);
};

export const CanvasProvider = ({ children }) => {
  const [numPages, setNumPages] = useState(null);
  const [currPage, setCurrPage] = useState(1);
  const [selectedFile, setFile] = useState(null);
  const [color, setColor] = useState("#000");
  const [borderColor, setBorderColor] = useState("#f4a261");
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [canvas, setCanvas] = useState("");
  const [isExporting, setExporting] = useState(false);
  const [hideCanvas, setHiddenCanvas] = useState(false);
  const [pageCanvases, setPageCanvases] = useState({});
  const [edits, setEdits] = useState({});
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [highlightWidth, setHighlightWidth] = useState(400); // Default width
  const [highlightHeight, setHighlightHeight] = useState(20); // Default height

  const exportPage = useRef(null);
  const [exportPages, setExportPages] = useState([]);

  useEffect(() => {
    if (document.getElementById("canvasWrapper"))
      document.getElementById("canvasWrapper").style.visibility = hideCanvas
        ? "hidden"
        : "visible";
  }, [hideCanvas]);

  useEffect(() => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.set("fill", color);
        canvas.renderAll();
      }
    }
  }, [color, canvas]);

  useEffect(() => {
    if (canvas) {
      if (canvas.isDrawingMode) canvas.freeDrawingBrush.color = borderColor;
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.set("stroke", borderColor);
        canvas.renderAll();
      }
    }
  }, [borderColor, canvas]);

  useEffect(() => {
    if (canvas) {
      if (canvas.isDrawingMode) canvas.freeDrawingBrush.width = strokeWidth;
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.set("strokeWidth", strokeWidth);
        canvas.renderAll();
      }
    }
  }, [strokeWidth, canvas]);

  useEffect(() => {
    if (canvas && isHighlightMode) {
      canvas.isDrawingMode = false;
      setIsDrawingMode(false);
    }
  }, [isHighlightMode, canvas]);

  useEffect(() => {
    if (canvas && isDrawingMode) {
      canvas.isHighlightMode = false;
      setIsHighlightMode(false);
    }
  }, [isDrawingMode, canvas]);

  useEffect(() => {
    if (!canvas) return;

    const handleCanvasClick = (opt) => {
      if (!isHighlightMode) return;

      const pointer = canvas.getPointer(opt.e);
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: highlightWidth, // Use dynamic width
        height: highlightHeight, // Use dynamic height
        fill: color,
        opacity: 0.4,
        cornerStyle: "circle",
        editable: true,
      });

      canvas.add(rect);
      canvas.renderAll();
      setIsHighlightMode(false); 
    };

    canvas.on("mouse:down", handleCanvasClick);
    return () => {
      canvas.off("mouse:down", handleCanvasClick);
    };
  }, [canvas, isHighlightMode, color, highlightWidth, highlightHeight]);

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
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (f) {
      const data = f.target.result;
      fabric.Image.fromURL(data, function (img) {
        img.scaleToWidth(300);
        canvi.add(img).renderAll();
      });
    };
    reader.readAsDataURL(file);
    canvi.isDrawingMode = false;
    setIsHighlightMode(false);
    setIsDrawingMode(false);
  };

  const addNote = (canvi) => {
    fabric.Image.fromURL(
      `./note/note${(Math.floor(Math.random() * 10) % 4) + 1}.png`,
      function (img) {
        img.scaleToWidth(100);
        canvi.add(img).renderAll();
      }
    );
    canvi.isDrawingMode = false;
    setIsHighlightMode(false);
    setIsDrawingMode(false);
  };

  const deleteBtn = () => {
    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        canvas.remove(obj);
      });

      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  };

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
    setIsHighlightMode(false);
    setIsDrawingMode(false);
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
    setIsHighlightMode(false);
    setIsDrawingMode(false);
  };

  const addText = (canvi) => {
    const text = new fabric.Textbox("Type Here ...", {
      editable: true,
    });
    text.set({ fill: color, fontFamily: "Times New Roman" });
    canvi.add(text);
    canvi.renderAll();
    canvi.isDrawingMode = false;    
    setIsHighlightMode(false);
    setIsDrawingMode(false);
  };

  const toggleDraw = (canvi) => {
    const newDrawingMode = !canvi.isDrawingMode;
    canvi.isDrawingMode = newDrawingMode;
    setIsDrawingMode(newDrawingMode);
    const brush = canvi.freeDrawingBrush;
    brush.color = borderColor;
    brush.width = strokeWidth;
  };

  const exportPdf = async () => {
    setExporting(true);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let pageIndex = 1;
    const totalPages = numPages;

    const exportNextPage = async () => {
      if (pageIndex > totalPages) {
        pdf.save("marked_submission.pdf");
        setExporting(false);
        return;
      }

      setCurrPage(pageIndex);
      await new Promise((resolve) => setTimeout(resolve, 500));

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
                pdf.addPage();
              }
              pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

              pageIndex += 1;
              exportNextPage();
            });
          }, 600);
        });
      } else {
        pageIndex += 1;
        exportNextPage();
      }
    };

    exportNextPage();
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
        isHighlightMode,
        setIsHighlightMode,
        highlightWidth, // Add to context
        setHighlightWidth, // Add to context
        highlightHeight, // Add to context
        setHighlightHeight, // Add to context
        isDrawingMode,
      }}
    >
      {children}
    </funButtons.Provider>
  );
};