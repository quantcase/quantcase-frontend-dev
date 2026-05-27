interface ColorRailProps {
  color: string;
  opacity?: number;
  insetY?: number;
}

export function ColorRail({ color, opacity = 1, insetY = 16 }: ColorRailProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: insetY,
        bottom: insetY,
        width: 3,
        borderRadius: "0 2px 2px 0",
        background: color,
        opacity,
      }}
    />
  );
}
