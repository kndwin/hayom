import { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="12" fill="#fff" />
      <path
        d="M4.574 10.952s.507-2.029 1.06-2.916a7.5 7.5 0 0 1 13.455 6.414"
        stroke="#000"
      />
      <circle cx="12" cy="12" r="11.5" stroke="#000" />
      <path
        d="M13 14.5s2-2.5 3.5-2 1.5 2 3.5 3 3 0 3 0M17.5 22c-9-2.5-9-5.5-10.5-8.5S3.5 10.5.5 12"
        stroke="#000"
      />
      <path d="M17.5 22c-9-2.5-9-5.5-10.5-8.5S3.5 10.5.5 12" stroke="#000" />
      <path d="M20 20.5c-5-2-7-6.03-7.5-7.015S9 10.5 7 13.485" stroke="#000" />
    </svg>
  );
}
