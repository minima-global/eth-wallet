import { useContext } from "react";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { appContext } from "../../AppContext";
import { useFormikContext } from "formik";

interface IProps {
  setStep: any;
}
const AddressBook = ({ setStep }: IProps) => {
  const { _wallet } = useWalletContext();
  const { _addressBook } = useContext(appContext);
  const formik = useFormikContext();



  // Define the filter condition
  const filterCondition = ([key]) => key !== _wallet!.address;

  // Filter out entries based on the condition
  const filteredEntries = Object.entries(_addressBook).filter(filterCondition as any);
  
  return (
    <div className="">
      <h3 className="mx-4 font-bold text-sm mb-2 text-purple-500">Address book</h3>
      <ul className="max-h-[50%] h-[250px] overflow-y-scroll">
        <li
          key={_wallet!.address}
          onClick={() => {
            formik.setFieldValue("address", _wallet!.address);
            setStep(2);
          }}
          className="px-4 py-2 hover:bg-slate-200 hover:bg-opacity-50 hover:text-black hover:dark:text-white hover:dark:bg-slate-800 hover:cursor-pointer"
        >
          <h3 className="font-bold text-sm">Your Account</h3>
          <p className="break-all">{_wallet!.address}</p>
        </li>
        {_addressBook &&
         filteredEntries.map(([key, value]: any) => (
            <li
              key={key}
              onClick={() => {
                formik.setFieldValue("address", key);
                setStep(2);
              }}
              className="px-4 py-2 hover:bg-slate-200 hover:bg-opacity-50 hover:text-black hover:dark:text-white hover:dark:bg-slate-800 hover:cursor-pointer"
            >
              <h3 className="font-bold text-sm">{value}</h3>
              <p className="break-all">{key}</p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AddressBook;
