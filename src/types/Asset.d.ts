import { ReactElement } from "react";
import { ERC20Token } from "./ERC20Tokens";

export interface Asset extends ERC20Token {
    decimals: number;
    type: 'ether' | 'erc20';
    icon: ReactElement;
}