import { useContext } from "react";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { appContext } from "../../AppContext";
import { useFormikContext } from "formik";
import Profile from "../UI/Profile";

interface IProps {
  setStep: any;
}
const AddressBook = ({ setStep }: IProps) => {
  const { _address } = useWalletContext();
  const { _addressBook } = useContext(appContext);
  const formik = useFormikContext();

  // Define the filter condition
  const filterCondition = ([key]) => key !== _address;

  // Filter out entries based on the condition
  const filteredEntries = Object.entries(_addressBook).filter(
    filterCondition as any
  );

  return (
    <div className="">
      <h3 className="mx-4 font-bold text-sm text-purple-500">Address book</h3>
      <ul className="max-h-[50%] h-[250px] overflow-y-scroll">
        <li
          key={_address}
          onClick={() => {
            formik.setFieldValue("address", _address);
            setStep(2);
          }}
          className="cursor-pointer px-4 py-2 hover:bg-gray-300 !bg-opacity-30 dark:hover:bg-[#1B1B1B] grid grid-cols-[48px_1fr] items-center gap-3"
        >
          <div>
            {_address && <Profile extraClass=" w-[48px]" input={_address} />}
          </div>
          <div>
            <h3 className="font-bold text-sm text-teal-500 dark:text-teal-300">My Account</h3>
            <p className="break-all text-sm tracking-widest">{_address}</p>
          </div>
        </li>
        {_addressBook &&
          filteredEntries.map(([key, value]: any) => (
            <li
              key={key}
              onClick={() => {
                formik.setFieldValue("address", key);
                setStep(2);
              }}
              className="cursor-pointer px-4 py-2 hover:bg-gray-300 !bg-opacity-30 dark:hover:bg-[#1B1B1B] grid grid-cols-[48px_1fr] items-center gap-3"
            >
              <div>
                <Profile extraClass=" w-[48px]" input={key} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{value}</h3>
                <p className="break-all text-sm tracking-widest">{key}</p>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AddressBook;
