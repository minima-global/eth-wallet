const Maximize = ({ fill, size = 20, extraClass }) => (
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
    <path d="M16 4l4 0l0 4" />
    <path d="M14 10l6 -6" />
    <path d="M8 20l-4 0l0 -4" />
    <path d="M4 20l6 -6" />
    <path d="M16 20l4 0l0 -4" />
    <path d="M14 14l6 6" />
    <path d="M8 4l-4 0l0 4" />
    <path d="M4 4l6 6" />
  </svg>
);

export default Maximize;
