import { useContext, useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import SettingsBoltIcon from '../../UI/Icons/SettingsBoltIcon';
import SlippageItem from './SlippageItem';
import Cross from '../../UI/Cross';
import { appContext } from '../../../AppContext';
import Decimal from 'decimal.js';
import Deadline from './Deadline';

const DropdownButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const dropdownRef = useRef(null); // Create a ref for the dropdown container

  const { swapWidgetSettings } = useContext(appContext);

  useEffect(() => {
    // When dropdown opens, set it to render
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  useEffect(() => {
    // When closing, delay rendering to allow animation
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match this to your animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    // Handle clicks outside of the dropdown
    const handleClickOutside = (event) => {
      //@ts-ignore
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Spring animation for dropdown
  const dropdownAnimation = useSpring({
    transform: isOpen ? 'scaleY(1)' : 'scaleY(0)',
    opacity: isOpen ? 1 : 0,
    transformOrigin: 'top',
    config: { tension: 200, friction: 20 },
  });

  // Spring animation for mobile dropdown (slide up)
  const mobileDropdownAnimation = useSpring({
    transform: isOpen ? 'translateY(0%)' : 'translateY(100%)',
    opacity: isOpen ? 1 : 0,
    config: { tension: 200, friction: 20 },
  });

  // Responsive handling for dropdown position
  const isMobile = window.innerWidth < 768;
  const customSlippageSettings = swapWidgetSettings && swapWidgetSettings.slippage !== null;
  const shouldWarn = swapWidgetSettings && swapWidgetSettings.slippage !== null && !isNaN(swapWidgetSettings.slippage) && (new Decimal(swapWidgetSettings.slippage).lt(0.05) || new Decimal(swapWidgetSettings.slippage).gt(1));

  return (
    <div className="relative" ref={dropdownRef}> {/* Apply ref here */}
      <div className="grid grid-cols-[1fr_auto]">
        <div />
        <div className={`${!!customSlippageSettings && `${shouldWarn ? "font-bold bg-amber-200 dark:bg-amber-300 dark:text-amber-700" : "bg-neutral-300 dark:bg-[#1B1B1B]"} flex items-center rounded-full pl-2`} py-1 mb-2`}>
          {!!customSlippageSettings && <div className='my-auto'><p className='text-xs px-1 font-bold tracking-widest text-neutral-800 dark:text-neutral-500'>{new Decimal(swapWidgetSettings.slippage).toString() + "%"}</p></div>}
          <button
            type="button"
            onClick={toggleDropdown}
            className="p-0 mb-1 text-neutral-800 hover:text-neutral-700 dark:text-neutral-600 transition-all ease-in-out hover:dark:text-neutral-500 pr-2"
          >
            <SettingsBoltIcon fill="currentColor" />
          </button>
        </div>
      </div>

      {shouldRender && (
        <animated.div
          style={isMobile ? mobileDropdownAnimation : dropdownAnimation}
          className={`${
            isMobile
              ? 'fixed left-0 inset-x-0 bottom-[80px] bg-white dark:bg-neutral-950 p-4 rounded-t-lg shadow-lg z-50'
              : 'absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-lg shadow-lg z-10'
          }`}
        >
          <ul className="py-4 px-2">
            {isMobile && <div className='grid grid-cols-[1fr_auto] items-center mb-4 px-3 dark:text-neutral-400 font-bold'><p>Settings</p><span><Cross dismiss={() => setIsOpen(false)} /> </span></div>}
            <SlippageItem />
            <Deadline />
          </ul>
        </animated.div>
      )}
    </div>
  );
};

export default DropdownButton;
