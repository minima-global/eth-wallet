import { useContext, useState } from "react";
import { appContext } from "../../AppContext";
import AddressBookAdd from "../AddressBookAdd";

interface IProps {
  address: string;
  contact?: boolean;
}
const AddressBookContact = ({ contact = false, address }: IProps) => {
  const { _addressBook, promptAddressBookAdd } = useContext(appContext);

  return (
    <div className="flex items-center gap-2 my-2">
      <svg
        className="fill-teal-400"
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        strokeWidth="2.5"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M10 9h.01" />
        <path d="M14 9h.01" />
        <path d="M12 3a7 7 0 0 1 7 7v1l1 0a2 2 0 1 1 0 4l-1 0v3l2 3h-10a6 6 0 0 1 -6 -5.775l0 -.226l-1 0a2 2 0 0 1 0 -4l1 0v-1a7 7 0 0 1 7 -7z" />
        <path d="M11 14h2a1 1 0 0 0 -2 0z" />
      </svg>
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

        {contact && (
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
