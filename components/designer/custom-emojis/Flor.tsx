import * as React from "react";

const Flor = ({ fillColor = '#C70F11', ...props }: React.SVGProps<SVGSVGElement> & { fillColor?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width="512"
    height="512"
    viewBox="0 0 100 100"
    {...props}
  >
    <path
      fill={fillColor}
      d="M90.78 49.92a17.48 17.48 0 0 0-10.24-8.74 17 17 0 0 0-2.35-.59 17.59 17.59 0 1 0-26.9-22.54A18 18 0 0 0 50 20.11a17.59 17.59 0 0 0-25.86-5.95 17.58 17.58 0 0 0-2.33 26.43 17 17 0 0 0-2.35.59 17.59 17.59 0 0 0 10.87 33.46 18 18 0 0 0 2.25-.91 17.59 17.59 0 1 0 34.84 0 18 18 0 0 0 2.25.91 17.59 17.59 0 0 0 21.11-24.72M50 67.25a17.5 17.5 0 1 1 17.5-17.5A17.52 17.52 0 0 1 50 67.25"
      data-original="#000000"
    ></path>
  </svg>
);

export default Flor;
