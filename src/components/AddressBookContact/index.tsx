import { useContext, useEffect, useState } from "react";
import { appContext } from "../../AppContext";
import AddressBookAdd from "../AddressBookAdd";
import Bear from "../UI/Avatars/Bear";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";

interface IProps {
  address: string;
  contact?: boolean;
}
const AddressBookContact = ({ contact = false, address }: IProps) => {
  const { _addressBook, promptAddressBookAdd } = useContext(appContext);
  const {_address} = useWalletContext();

  const ownAddress = _address === address;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
  
    window.addEventListener('resize', handleResize);
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  

  const [_f, setF] = useState(false);

  return (
    <div className="flex items-center gap-2 py-2">
      <Bear extraClass="w-[34px] min-w-[34px]" input={address} />
      <div className="flex justify-center items-center">
        <div>
          <h3 className="text-sm font-bold text-teal-800 dark:text-white dark:opacity-60">
            {_addressBook[address] && _addressBook[address].length
              ? _addressBook[address]
              : "Account"}
          </h3>

          <input onBlur={() => setF(false)} onFocus={() => setF(true)} readOnly className={`w-full focus:font-bold font-mono max-w text-xs bg-transparent truncate focus:outline-none focus:trailing-wider `} value={`${_f ? address : address.substring(0, windowWidth < 560 ? 4 : 8)+'...'+address.substring(address.length-(windowWidth < 560 ? 4 : 8), address.length)}`} /> 
        </div>

        {contact && !ownAddress && (
          <span className="text-yellow-300">
            <svg
              onClick={promptAddressBookAdd}
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="min-w-[16px]"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
              <path d="M13.5 6.5l4 4" />
            </svg>
          </span>
        )}

        <AddressBookAdd address={address} />
      </div>
    </div>
  );
};

export default AddressBookContact;
