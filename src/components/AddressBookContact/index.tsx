import { useContext } from "react";
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
  // console.log("ownAddress", ownAddress);
  return (
    <div className="flex items-center gap-2 my-2">
      <Bear extraClass="w-[34px]" input={address} />
      <div className="flex">
        <div className="flex-col">
          <h3 className="text-sm font-bold text-teal-800">
            {_addressBook[address] && _addressBook[address].length
              ? _addressBook[address]
              : "Account"}
          </h3>
          <p className="text-sm font-bold">
            {address.substring(0, 7)}...
            {address.substring(address.length - 5, address.length)}
          </p>
        </div>

        {contact && !ownAddress && (
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
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
            <path d="M13.5 6.5l4 4" />
          </svg>
        )}

        <AddressBookAdd address={address} />
      </div>
    </div>
  );
};

export default AddressBookContact;
