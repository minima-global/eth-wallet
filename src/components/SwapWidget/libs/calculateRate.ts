import Decimal from "decimal.js";

const calculateRate = (inputAmount: number, outputAmount: number) => {

    try {
        if (new Decimal(inputAmount).lt(0)) {
            throw new Error("inputAmount must be greater than zero");
        }

        const rate = new Decimal(outputAmount).dividedBy(inputAmount);
        
        return rate;
    } catch (error) {
        return 0;
    }

}

export default calculateRate;