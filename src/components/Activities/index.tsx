import { TransactionReceipt, formatEther } from "ethers";
import { appContext } from "../../AppContext";
import { useContext, useEffect, useState } from "react";
import { useActivityHandlerContext } from "../../providers/ActivityHandlerProvider";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";

const Activity = () => {
  const { _currentNavigation, _activities } =
    useContext(appContext);

  if (_currentNavigation !== "activity") {
    return null;
  }

  return (
    <div className="px-4 md:px-0">
      <h3 className="font-bold">Activities</h3>

      <ul className="mt-2">
        {_activities &&
          _activities.map((activity, index) => (
            <ActivityListItem key={index} transactionResponse={activity} />
          ))}
      </ul>
    </div>
  );
};

export default Activity;

const ActivityListItem = ({ transactionResponse }) => {
  const { _wallet } = useWalletContext();
  const { getTransactionReceipt } = useActivityHandlerContext();
  const [transaction, setTransaction] = useState<TransactionReceipt | null>(
    null
  );

  useEffect(() => {
    (async () => {
      const txReceipt = await getTransactionReceipt(transactionResponse.hash);
      setTransaction(txReceipt);
    })();
  }, []);

  if (!transaction) {
    return <div>no</div>;
  }

  return (
    <li className="grid grid-cols-[1fr_auto] bg-white items-center rounded-md bg-opacity-30 dark:bg-opacity-10 p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30 mb-2">
      <div className="flex gap-1">
        <div className={`my-auto rounded-full ${_wallet!.address === transaction!.from ? 'bg-orange-300' : 'bg-teal-300'}`}>
          {_wallet!.address === transaction!.from ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#000000"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 19v2h16v-14l-8 -4l-8 4v2" />
              <path d="M13 14h-9" />
              <path d="M7 11l-3 3l3 3" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"              
              width="32"
              height="32"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#000000"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 18v3h16v-14l-8 -4l-8 4v3" />
              <path d="M4 14h9" />
              <path d="M10 11l3 3l-3 3" />
            </svg>
          )}
        </div>

        <div className="my-auto">
          <h3 className="font-bold">{_wallet!.address === transaction!.from ? "Send" : "Receive"}</h3>
          {transaction.status === 1 && <p className="text-teal-600 text-sm">Confirmed</p>}
          {transaction.status === 0 && <p className="text-red-600 text-sm">Rejected</p>}
        </div>
      </div>
      <div>
        <h3 className="font-bold">{formatEther(transactionResponse.value)}</h3>
        <p></p>
      </div>
    </li>
  );
};
