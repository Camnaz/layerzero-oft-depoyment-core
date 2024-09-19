// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { CrossChainToken } from "../CrossChainToken.sol";  // Import CrossChainToken.sol instead of MyOFT.sol

// @dev WARNING: This is for testing purposes only
contract CrossChainTokenMock is CrossChainToken {  // Rename the contract for clarity
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) CrossChainToken(_name, _symbol, _lzEndpoint, _delegate) {}

    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);  // Use the inherited _mint function
    }
}
