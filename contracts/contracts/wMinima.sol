pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract wMinima is ERC20 {
    constructor() ERC20("wMinima", "WMINIMA") {
        _mint(msg.sender, 250000000 * 10 ** uint(decimals()));
    }
}
