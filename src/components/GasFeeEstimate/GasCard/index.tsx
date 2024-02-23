import { useEffect, useState } from "react";
import { GasFeeEstimate } from "../../../types/GasFeeInterface";
import * as utils from "../../../utils";
import { useGasContext } from "../../../providers/GasProvider";

interface IProps {
  type: "low" | "medium" | "high";
  card: GasFeeEstimate;
  gasUnit: bigint;
}
const GasCard = ({ type, card, gasUnit }: IProps) => {
  const { defaultGas, selectGasCard, promptGasCards } = useGasContext();

  const [maxFee, setMaxFee] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const gasFee = await utils.calculateGasFee(
        gasUnit.toString(),
        card.suggestedMaxFeePerGas,
        card.suggestedMaxPriorityFeePerGas
      );
      setMaxFee(gasFee.finalGasFee);
    })();
  }, [card, gasUnit]);

  return (
    <div
      onClick={() => {
        selectGasCard(type);
        promptGasCards();
      }}
      className={`grid grid-cols-3 py-2 hover:bg-gray-200 hover:text-black px-4 rounded-full ${
        type === defaultGas
          ? "dark:bg-slate-300 bg-teal-300 text-black font-bold"
          : ""
      }`}
    >
      <div className="flex items-center gap-1">
        {type === "low" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth={`${type === defaultGas ? "2.5" : "1.5"}`}
            stroke={`${type === defaultGas ? "#000000" : "currentColor"}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M16.69 7.44a6.973 6.973 0 0 0 -1.69 4.56c0 1.747 .64 3.345 1.699 4.571" />
            <path d="M2 9.504c7.715 8.647 14.75 10.265 20 2.498c-5.25 -7.761 -12.285 -6.142 -20 2.504" />
            <path d="M18 11v.01" />
            <path d="M11.5 10.5c-.667 1 -.667 2 0 3" />
          </svg>
        )}
        {type === "high" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth={`${type === defaultGas ? "2.5" : "1.5"}`}
            stroke={`${type === defaultGas ? "#000000" : "currentColor"}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 11v.01" />
            <path d="M16 3l0 3.803a6.019 6.019 0 0 1 2.658 3.197h1.341a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-1.342a6.008 6.008 0 0 1 -1.658 2.473v2.027a1.5 1.5 0 0 1 -3 0v-.583a6.04 6.04 0 0 1 -1 .083h-4a6.04 6.04 0 0 1 -1 -.083v.583a1.5 1.5 0 0 1 -3 0v-2l0 -.027a6 6 0 0 1 4 -10.473h2.5l4.5 -3z" />
          </svg>
        )}
        {type === "medium" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth={`${type === defaultGas ? "2.5" : "1.5"}`}
            stroke={`${type === defaultGas ? "#000000" : "currentColor"}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M11 5h2" />
            <path d="M19 12c-.667 5.333 -2.333 8 -5 8h-4c-2.667 0 -4.333 -2.667 -5 -8" />
            <path d="M11 16c0 .667 .333 1 1 1s1 -.333 1 -1h-2z" />
            <path d="M12 18v2" />
            <path d="M10 11v.01" />
            <path d="M14 11v.01" />
            <path d="M5 4l6 .97l-6.238 6.688a1.021 1.021 0 0 1 -1.41 .111a.953 .953 0 0 1 -.327 -.954l1.975 -6.815z" />
            <path d="M19 4l-6 .97l6.238 6.688c.358 .408 .989 .458 1.41 .111a.953 .953 0 0 0 .327 -.954l-1.975 -6.815z" />
          </svg>
        )}
        <p className="text-sm">{type}</p>
      </div>
      <div>
        <p className="text-sm">{card.minWaitTimeEstimate / 1000 + "s"}</p>
      </div>
      <div>
        <p className="truncate text-sm">{maxFee}</p>
      </div>
    </div>
  );
};

export default GasCard;
