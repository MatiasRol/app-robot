interface MapMetadata {
  width_px: number;
  height_px: number;
  resolution: number;
  origin: [number, number, number];
}

export function pixelToWorld(
  pixelX: number,
  pixelY: number,
  metadata: MapMetadata
): { worldX: number; worldY: number } {
  const worldX = metadata.origin[0] + pixelX * metadata.resolution;
  const worldY = metadata.origin[1] + (metadata.height_px - pixelY) * metadata.resolution;
  return { worldX, worldY };
}

export function worldToPixel(
  worldX: number,
  worldY: number,
  metadata: MapMetadata
): { pixelX: number; pixelY: number } {
  const pixelX = (worldX - metadata.origin[0]) / metadata.resolution;
  const pixelY = metadata.height_px - (worldY - metadata.origin[1]) / metadata.resolution;
  return { pixelX: Math.round(pixelX), pixelY: Math.round(pixelY) };
}

export function worldToSvgCoords(
  worldX: number,
  worldY: number,
  metadata: { width_px: number; height_px: number; resolution: number; origin: [number, number, number] },
  scaleFactor: number
): { svgX: number; svgY: number } {
  const { pixelX, pixelY } = worldToPixel(worldX, worldY, metadata);
  return {
    svgX: pixelX * scaleFactor,
    svgY: pixelY * scaleFactor,
  };
}
