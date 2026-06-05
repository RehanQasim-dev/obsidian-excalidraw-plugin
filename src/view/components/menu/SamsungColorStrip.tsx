import * as React from "react";
import clsx from "clsx";
import ExcalidrawView from "src/view/ExcalidrawView";
import { AppState } from "@zsviczian/excalidraw/types/excalidraw/types";
import { DEVICE } from "src/constants/constants";

interface SamsungColorStripProps {
  view: ExcalidrawView;
  appState: AppState | null;
}

export const SamsungColorStrip: React.FC<SamsungColorStripProps> = ({ view, appState }) => {
  // Read current colors from plugin settings
  const [colors, setColors] = React.useState<string[]>(
    view.plugin.settings.samsungColors || ["#000000", "#e03131", "#1971c2", "#2f9e41"]
  );

  // Active state read from Excalidraw's appState
  const activeStrokeColor = appState?.currentItemStrokeColor || "#000000";
  const activeBgColor = appState?.currentItemBackgroundColor || "transparent";
  const activeTool = appState?.activeTool?.type || "selection";

  // Hide toolbar if we are not in samsung mode
  const currentMode = view.plugin.getPreferredUIMode();
  if (currentMode !== "samsung") {
    return null;
  }

  // Update stroke color
  const selectStrokeColor = (color: string) => {
    view.excalidrawAPI?.updateScene({
      appState: {
        currentItemStrokeColor: color,
      },
    });
  };

  // Update background color
  const selectBgColor = (color: string) => {
    view.excalidrawAPI?.updateScene({
      appState: {
        currentItemBackgroundColor: color,
      },
    });
  };

  // Update a color slot and save to settings
  const handleColorChange = (index: number, newColor: string) => {
    const nextColors = [...colors];
    nextColors[index] = newColor;
    setColors(nextColors);
    
    // Save to plugin settings
    view.plugin.settings.samsungColors = nextColors;
    view.plugin.saveSettings();
    
    // Auto-select the newly updated color
    selectStrokeColor(newColor);
  };

  // Cycle stroke thickness
  const cycleStrokeWidth = () => {
    const currentWidth = appState?.currentItemStrokeWidth || 1;
    let nextWidth = 1;
    if (currentWidth === 1) nextWidth = 2;
    else if (currentWidth === 2) nextWidth = 3;
    else if (currentWidth === 3) nextWidth = 4;
    else nextWidth = 1;

    view.excalidrawAPI?.updateScene({
      appState: {
        currentItemStrokeWidth: nextWidth,
      },
    });
  };

  // Cycle stroke style (solid, dashed, dotted)
  const cycleStrokeStyle = () => {
    const currentStyle = appState?.currentItemStrokeStyle || "solid";
    let nextStyle: "solid" | "dashed" | "dotted" = "solid";
    if (currentStyle === "solid") nextStyle = "dashed";
    else if (currentStyle === "dashed") nextStyle = "dotted";
    else nextStyle = "solid";

    view.excalidrawAPI?.updateScene({
      appState: {
        currentItemStrokeStyle: nextStyle,
      },
    });
  };

  // Cycle roughness (sloppiness)
  const cycleRoughness = () => {
    const currentRoughness = appState?.currentItemRoughness ?? 1;
    const nextRoughness = (currentRoughness + 1) % 3;
    view.excalidrawAPI?.updateScene({
      appState: {
        currentItemRoughness: nextRoughness,
      },
    });
  };

  // Cycle roundness/edges
  const cycleRoundness = () => {
    const currentRoundness = appState?.currentItemRoundness || "round";
    const nextRoundness = currentRoundness === "round" ? "sharp" : "round";
    view.excalidrawAPI?.updateScene({
      appState: {
        currentItemRoundness: nextRoundness,
      },
    });
  };

  // Cycle opacity (100 -> 75 -> 50 -> 25 -> 100)
  const cycleOpacity = () => {
    const currentOpacity = appState?.currentItemOpacity ?? 100;
    let nextOpacity = 100;
    if (currentOpacity >= 90) nextOpacity = 75;
    else if (currentOpacity >= 70) nextOpacity = 50;
    else if (currentOpacity >= 40) nextOpacity = 25;
    else nextOpacity = 100;

    view.excalidrawAPI?.updateScene({
      appState: {
        currentItemOpacity: nextOpacity,
      },
    });
  };

  // Cycle arrowheads
  const cycleArrowheads = () => {
    const currentArrowhead = appState?.currentItemEndArrowhead || null;
    let nextArrowhead: any = null;
    if (currentArrowhead === null) nextArrowhead = "arrow";
    else if (currentArrowhead === "arrow") nextArrowhead = "triangle";
    else if (currentArrowhead === "triangle") nextArrowhead = "dot";
    else if (currentArrowhead === "dot") nextArrowhead = "bar";
    else nextArrowhead = null;

    view.excalidrawAPI?.updateScene({
      appState: {
        currentItemStartArrowhead: nextArrowhead,
        currentItemEndArrowhead: nextArrowhead,
      },
    });
  };

  // Cycle arrow type (curved vs straight)
  const cycleArrowType = () => {
    const currentArrowType = appState?.currentItemArrowType || "round";
    const nextArrowType = currentArrowType === "round" ? "sharp" : "round";
    view.excalidrawAPI?.updateScene({
      appState: {
        currentItemArrowType: nextArrowType,
      },
    });
  };

  // Cycle fill style (hachure, cross-hatch, solid, zigzag)
  const cycleFillStyle = () => {
    const currentFill = appState?.currentItemFillStyle || "hachure";
    let nextFill: "hachure" | "cross-hatch" | "solid" | "zigzag" = "hachure";
    if (currentFill === "hachure") nextFill = "cross-hatch";
    else if (currentFill === "cross-hatch") nextFill = "solid";
    else if (currentFill === "solid") nextFill = "zigzag";
    else nextFill = "hachure";

    view.excalidrawAPI?.updateScene({
      appState: {
        currentItemFillStyle: nextFill,
      },
    });
  };

  // Cycle layers (if elements selected)
  const cycleLayers = () => {
    const api = view.excalidrawAPI;
    if (!api) return;
    const selectedElements = api.getSceneElements().filter(
      (el) => appState?.selectedElementIds?.[el.id]
    );
    if (selectedElements.length === 0) return;
    
    const allElements = [...api.getSceneElements()];
    const selectedIds = new Set(selectedElements.map(el => el.id));
    const isAtEnd = allElements.slice(-selectedElements.length).every(el => selectedIds.has(el.id));
    
    let updatedElements = [];
    if (isAtEnd) {
      // Send to back
      const nonSelected = allElements.filter(el => !selectedIds.has(el.id));
      const selected = allElements.filter(el => selectedIds.has(el.id));
      updatedElements = [...selected, ...nonSelected];
    } else {
      // Bring to front
      const nonSelected = allElements.filter(el => !selectedIds.has(el.id));
      const selected = allElements.filter(el => selectedIds.has(el.id));
      updatedElements = [...nonSelected, ...selected];
    }
    
    api.updateScene({
      elements: updatedElements,
    });
  };

  // Undo action
  const handleUndo = () => {
    const api = view.excalidrawAPI as any;
    if (api && api.history && typeof api.history.undo === "function") {
      api.history.undo();
    } else {
      const event = new KeyboardEvent("keydown", {
        key: "z",
        code: "KeyZ",
        ctrlKey: !DEVICE.isMacOS,
        metaKey: DEVICE.isMacOS,
        bubbles: true,
        cancelable: true,
      });
      view.excalidrawWrapperRef?.current?.dispatchEvent(event);
    }
  };

  const hasSelection = appState?.selectedElementIds && Object.keys(appState.selectedElementIds).length > 0;

  // Render tool-specific options dynamically
  const renderToolOptions = () => {
    const options: JSX.Element[] = [];

    // 1. Stroke Style
    if (["line", "arrow", "rectangle", "ellipse", "diamond", "freedraw"].includes(activeTool)) {
      const strokeStyle = appState?.currentItemStrokeStyle || "solid";
      options.push(
        <button
          key="stroke-style"
          onClick={cycleStrokeStyle}
          className="samsung-btn"
          title="Cycle Stroke Style"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            {strokeStyle === "solid" && <line x1="4" y1="12" x2="20" y2="12" />}
            {strokeStyle === "dashed" && <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="4,4" />}
            {strokeStyle === "dotted" && <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="1,3" strokeLinecap="round" />}
          </svg>
          <span className="samsung-btn-label">Style</span>
        </button>
      );
    }

    // 2. Sloppiness (Roughness)
    if (["line", "arrow", "rectangle", "ellipse", "diamond"].includes(activeTool)) {
      const roughness = appState?.currentItemRoughness ?? 1;
      options.push(
        <button
          key="roughness"
          onClick={cycleRoughness}
          className="samsung-btn"
          title="Cycle Sloppiness"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            {roughness === 0 && <rect x="5" y="5" width="14" height="14" rx="1" />}
            {roughness === 1 && <path d="M5.5 5.5 C 10 4.5, 14 6.5, 18.5 5.5 C 19.5 10, 17.5 14, 18.5 18.5 C 14 19.5, 10 17.5, 5.5 18.5 C 4.5 14, 6.5 10, 5.5 5.5 Z" />}
            {roughness === 2 && <path d="M5.1 6.3 C 9.2 4.1, 14.8 7.2, 19.2 4.9 C 20.1 9.3, 16.9 14.5, 19.1 19.3 C 13.9 20.2, 9.1 16.8, 4.9 19.1 C 3.8 13.9, 7.3 9.2, 5.1 6.3 Z" />}
          </svg>
          <span className="samsung-btn-label">Rough</span>
        </button>
      );
    }

    // 3. Edges / Roundness
    if (["line", "rectangle", "diamond"].includes(activeTool)) {
      const roundness = appState?.currentItemRoundness || "round";
      options.push(
        <button
          key="roundness"
          onClick={cycleRoundness}
          className="samsung-btn"
          title="Cycle Edges"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            {roundness === "round" ? (
              <rect x="5" y="5" width="14" height="14" rx="4" />
            ) : (
              <rect x="5" y="5" width="14" height="14" rx="0" />
            )}
          </svg>
          <span className="samsung-btn-label">Edges</span>
        </button>
      );
    }

    // 4. Arrowheads
    if (activeTool === "arrow") {
      const arrowhead = appState?.currentItemEndArrowhead || null;
      options.push(
        <button
          key="arrowheads"
          onClick={cycleArrowheads}
          className="samsung-btn"
          title="Cycle Arrowheads"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="12" x2="20" y2="12" />
            {arrowhead === "arrow" && <path d="M14 6 l6 6 l-6 6" />}
            {arrowhead === "triangle" && <polygon points="20,12 14,6 14,18" fill="currentColor" />}
            {arrowhead === "dot" && <circle cx="17" cy="12" r="3" fill="currentColor" />}
            {arrowhead === "bar" && <line x1="17" y1="6" x2="17" y2="18" />}
          </svg>
          <span className="samsung-btn-label">Heads</span>
        </button>
      );
    }

    // 5. Arrow Type / Curved
    if (activeTool === "arrow") {
      const arrowType = appState?.currentItemArrowType || "round";
      options.push(
        <button
          key="arrow-type"
          onClick={cycleArrowType}
          className="samsung-btn"
          title="Cycle Arrow Type"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            {arrowType === "round" ? (
              <path d="M4 18 C 8 6, 16 6, 20 18" />
            ) : (
              <path d="M4 18 L 12 6 L 20 18" />
            )}
          </svg>
          <span className="samsung-btn-label">Curve</span>
        </button>
      );
    }

    // 6. Fill Style
    if (["rectangle", "ellipse", "diamond"].includes(activeTool)) {
      const fillStyle = appState?.currentItemFillStyle || "hachure";
      options.push(
        <button
          key="fill-style"
          onClick={cycleFillStyle}
          className="samsung-btn"
          title="Cycle Fill Style"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="5" width="14" height="14" rx="1" />
            {fillStyle === "hachure" && <line x1="5" y1="19" x2="19" y2="5" />}
            {fillStyle === "cross-hatch" && (
              <>
                <line x1="5" y1="19" x2="19" y2="5" />
                <line x1="5" y1="5" x2="19" y2="19" />
              </>
            )}
            {fillStyle === "solid" && <rect x="8" y="8" width="8" height="8" fill="currentColor" />}
            {fillStyle === "zigzag" && <path d="M6 9 l3 6 l3-6 l3 6 l3-6" />}
          </svg>
          <span className="samsung-btn-label">Fill</span>
        </button>
      );
    }

    // 7. Opacity
    const opacity = appState?.currentItemOpacity ?? 100;
    options.push(
      <button
        key="opacity"
        onClick={cycleOpacity}
        className="samsung-btn"
        title="Cycle Opacity"
      >
        <div style={{
          position: "relative",
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: "2px solid currentColor",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "currentColor",
            opacity: opacity / 100
          }} />
        </div>
        <span className="samsung-btn-label">{opacity}%</span>
      </button>
    );

    // 8. Layers
    if (hasSelection) {
      options.push(
        <button
          key="layers"
          onClick={cycleLayers}
          className="samsung-btn"
          title="Cycle Layers"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2 L2 7 L12 12 L22 7 Z" />
            <path d="M2 17 L12 22 L22 17" />
            <path d="M2 12 L12 17 L22 12" />
          </svg>
          <span className="samsung-btn-label">Layer</span>
        </button>
      );
    }

    return options;
  };

  return (
    <div className="samsung-color-strip">
      {/* 4 Stroke Colors */}
      <div className="samsung-colors-group">
        {colors.map((color, index) => {
          const isActive = activeStrokeColor === color;
          return (
            <div key={index} className="samsung-color-slot">
              <button
                className={clsx("samsung-color-dot", { active: isActive })}
                style={{ backgroundColor: color }}
                onClick={() => {
                  if (isActive) {
                    const picker = document.getElementById(`samsung-picker-${index}`);
                    picker?.click();
                  } else {
                    selectStrokeColor(color);
                  }
                }}
              />
              <input
                id={`samsung-picker-${index}`}
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                style={{ display: "none" }}
              />
            </div>
          );
        })}
      </div>

      {/* 1 Background Color */}
      <div className="samsung-bg-group">
        <div className="samsung-color-slot">
          <button
            className="samsung-color-dot bg-dot"
            style={{ backgroundColor: activeBgColor === "transparent" ? "#ffffff" : activeBgColor }}
            onClick={() => {
              const picker = document.getElementById("samsung-picker-bg");
              picker?.click();
            }}
          >
            {activeBgColor === "transparent" && <div className="transparent-slash" />}
          </button>
          <input
            id="samsung-picker-bg"
            type="color"
            value={activeBgColor === "transparent" ? "#ffffff" : activeBgColor}
            onChange={(e) => selectBgColor(e.target.value)}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className="samsung-divider" />

      {/* Dynamic Stroke Thickness */}
      <button
        onClick={cycleStrokeWidth}
        className="samsung-btn"
        title="Cycle Stroke Thickness"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r={2 + (appState?.currentItemStrokeWidth || 1) * 2} fill="currentColor" />
        </svg>
        <span className="samsung-btn-label">Size</span>
      </button>

      {/* Dynamic Tool Options */}
      {renderToolOptions()}

      <div className="samsung-divider" />

      {/* Undo Button */}
      <button
        onClick={handleUndo}
        className="samsung-btn undo-btn"
        title="Undo"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7v6h6M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
        </svg>
        <span className="samsung-btn-label">Undo</span>
      </button>
    </div>
  );
};
