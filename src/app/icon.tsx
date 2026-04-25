import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0d0d0d",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
          <path
            d="M9 0C9 0 14 5 14 9C14 9 16 7 15 4C15 4 18 7 18 12C18 17.523 13.971 22 9 22C4.029 22 0 17.523 0 12C0 7 4 4 4 4C4 4 3.5 8 6 9C6 9 4 6 9 0Z"
            fill="url(#flame)"
          />
          <path
            d="M9 12C9 12 11 14 11 16C11 17.657 10.105 19 9 19C7.895 19 7 17.657 7 16C7 14 9 12 9 12Z"
            fill="#fff"
            opacity="0.3"
          />
          <defs>
            <linearGradient id="flame" x1="9" y1="0" x2="9" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    { ...size }
  );
}
