const SwitchIcon = ({ fill, size =22 }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    strokeWidth="2.5"
    stroke={fill}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M3 8l4 -4l4 4" />
  <path d="M7 4l0 9" />
  <path d="M13 16l4 4l4 -4" />
  <path d="M17 10l0 10" />
  </svg>
);

export default SwitchIcon;
