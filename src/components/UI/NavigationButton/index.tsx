import { ReactElement } from "react";

interface IProps {
  icon: ReactElement;
  title: string;
  active: boolean;
  onClick: (e: any) => void;
  footer?: boolean;
}
const NavigationButton = ({ footer = false,icon, title, active, onClick }: IProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`focus:outline-none ${active && "!bg-black !text-white"} dark:hover:bg-black hover:opacity-80 bg-white dark:bg-[#1B1B1B] text-black dark:text-white dark:opacity-80 font-bold gap-1 items-center flex justify-center ${footer && "!bg-transparent !text-white !py-4"}`}
    >
      <span className={`text-black dark:text-white ${active && "text-orange-500 dark:text-orange-400"} ${footer && "!text-white"}`}>{icon}</span>
      {title}
    </button>
  );
};

export default NavigationButton;
