import Decimal from "decimal.js";

export function createDecimal(val: string): Decimal | null {
    // Check if the entire input is a valid number
    const regex = /^[0-9]+(\.[0-9]+)?$/;
    if (!regex.test(val)) {
      // If input contains characters other than numbers, return null
      return null;
    }
  
    // If input is a valid number, create a Decimal instance
    return new Decimal(val);
  }

  export default createDecimal;