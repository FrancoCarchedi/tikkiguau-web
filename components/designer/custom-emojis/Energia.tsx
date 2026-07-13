import * as React from "react";

const Energia = ({ fillColor = '#C70F11', style, ...props }: React.SVGProps<SVGSVGElement> & { fillColor?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width="512"
    height="512"
    viewBox="0 0 512 512"
    style={{ transform: "rotate(270deg)", ...style }}
    {...props}
  >
    <path
      fill={fillColor}
      d="M401.094 145.996 281.912 285.142h113.943c3.12 0 4.433 3.981 1.925 5.837L99.975 511.329c-3.017 2.232-6.778-1.6-4.489-4.575l124.419-161.665h-95.994c-2.764 0-4.255-3.241-2.458-5.341l119.182-139.146H119.849c-3.147 0-4.442-4.038-1.882-5.868L389.452.634c2.986-2.135 6.657 1.564 4.5 4.534l-98.428 135.488h103.112c2.764 0 4.256 3.241 2.458 5.34"
      data-original="#ffe360"
    ></path>
  </svg>
);

export default Energia;
