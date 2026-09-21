import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/Logo";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<LogoMark className="h-12 w-12" />, size);
}
