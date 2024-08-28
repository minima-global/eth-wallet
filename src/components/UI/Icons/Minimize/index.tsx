const Minimize = ({ fill, size = 20, extraClass }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    className={extraClass}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke={fill}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 9l4 0l0 -4" />
    <path d="M3 3l6 6" />
    <path d="M5 15l4 0l0 4" />
    <path d="M3 21l6 -6" />
    <path d="M19 9l-4 0l0 -4" />
    <path d="M15 9l6 -6" />
    <path d="M19 15l-4 0l0 4" />
    <path d="M15 15l6 6" />
  </svg>
);

export default Minimize;
