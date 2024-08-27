import { useState } from "react";
import { sql } from "../utils/SQL";

interface SwapWidgetSettings {
  slippage: string;
  deadline: string;
}
const useSwapWidget = () => {
  const [swapDirection, setSwapDirection] = useState<"wminima" | "usdt">(
    "usdt"
  );
  
  const [swapWidgetSettings, setSwapWidgetSettings] = useState<null | SwapWidgetSettings>(null);
  
  
  const updateSwapWidgetSettings = async (newSettings: SwapWidgetSettings) => {
    // Update the `current` property for each account
    const updatedData = {...swapWidgetSettings, ...newSettings};

    // Update the state with the modified accounts
    setSwapWidgetSettings(updatedData);

    // Retrieve the existing rows from the cache
    const rows = await sql(`SELECT * FROM cache WHERE name = 'SWAP_WIDGET_SETTINGS'`);

    // If the row doesn't exist, insert a new one; otherwise, update the existing row
    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('SWAP_WIDGET_SETTINGS', '${JSON.stringify(
          updatedData
        )}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        )}' WHERE name = 'SWAP_WIDGET_SETTINGS'`
      );
    }

    console.log("Saved!");
  }

  return {
    swapDirection,
    setSwapDirection,
    swapWidgetSettings, setSwapWidgetSettings,
    updateSwapWidgetSettings
  };
};

export default useSwapWidget;
