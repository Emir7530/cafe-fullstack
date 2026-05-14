import {
  useEffect,
  useRef,
  type ChangeEvent,
  type PointerEvent,
} from "react";
import "./ImageCropEditor.css";

type ImageCropEditorProps = {
  imageSrc: string;
  cropX: number;
  cropY: number;
  zoom: number;
  onChange: (settings: {
    imageCropX: number;
    imageCropY: number;
    imageZoom: number;
  }) => void;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const getMaxPan = (zoom: number) => {
  return ((Math.max(zoom, MIN_ZOOM) - 1) / Math.max(zoom, MIN_ZOOM)) * 50;
};

function ImageCropEditor({
  imageSrc,
  cropX,
  cropY,
  zoom,
  onChange,
}: ImageCropEditorProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startCropX: number;
    startCropY: number;
  } | null>(null);

  const normalizedZoom = clamp(zoom || MIN_ZOOM, MIN_ZOOM, MAX_ZOOM);
  const maxPan = getMaxPan(normalizedZoom);
  const normalizedCropX = clamp(cropX || 0, -maxPan, maxPan);
  const normalizedCropY = clamp(cropY || 0, -maxPan, maxPan);

  useEffect(() => {
    if (
      normalizedCropX !== cropX ||
      normalizedCropY !== cropY ||
      normalizedZoom !== zoom
    ) {
      onChange({
        imageCropX: normalizedCropX,
        imageCropY: normalizedCropY,
        imageZoom: normalizedZoom,
      });
    }
  }, [
    cropX,
    cropY,
    normalizedCropX,
    normalizedCropY,
    normalizedZoom,
    onChange,
    zoom,
  ]);

  const updateCrop = (nextCropX: number, nextCropY: number) => {
    const currentMaxPan = getMaxPan(normalizedZoom);

    onChange({
      imageCropX: clamp(nextCropX, -currentMaxPan, currentMaxPan),
      imageCropY: clamp(nextCropY, -currentMaxPan, currentMaxPan),
      imageZoom: normalizedZoom,
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;

    previewRef.current.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startCropX: normalizedCropX,
      startCropY: normalizedCropY,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!previewRef.current || !dragRef.current) return;
    if (dragRef.current.pointerId !== event.pointerId) return;

    const previewWidth = previewRef.current.getBoundingClientRect().width;
    if (previewWidth <= 0) return;

    const moveX = ((event.clientX - dragRef.current.startX) / previewWidth) * 100;
    const moveY = ((event.clientY - dragRef.current.startY) / previewWidth) * 100;

    updateCrop(dragRef.current.startCropX + moveX, dragRef.current.startCropY + moveY);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!previewRef.current || !dragRef.current) return;
    if (dragRef.current.pointerId !== event.pointerId) return;

    previewRef.current.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  const handleZoomChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextZoom = clamp(Number(event.target.value), MIN_ZOOM, MAX_ZOOM);
    const nextMaxPan = getMaxPan(nextZoom);

    onChange({
      imageCropX: clamp(normalizedCropX, -nextMaxPan, nextMaxPan),
      imageCropY: clamp(normalizedCropY, -nextMaxPan, nextMaxPan),
      imageZoom: nextZoom,
    });
  };

  const handleReset = () => {
    onChange({
      imageCropX: 0,
      imageCropY: 0,
      imageZoom: 1,
    });
  };

  return (
    <div className="image-crop-editor">
      <div
        ref={previewRef}
        className="image-crop-editor-preview"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <img
          src={imageSrc}
          alt=""
          draggable="false"
          style={{
            transform: `translate(${normalizedCropX}%, ${normalizedCropY}%) scale(${normalizedZoom})`,
          }}
        />
      </div>

      <div className="image-crop-editor-controls">
        <label>
          <span>Zoom: {normalizedZoom.toFixed(1)}x</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step="0.1"
            value={normalizedZoom}
            onChange={handleZoomChange}
          />
        </label>

        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </div>

      <p>Drag image to center it inside the square.</p>
    </div>
  );
}

export default ImageCropEditor;
