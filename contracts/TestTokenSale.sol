// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./TestToken.sol";

contract TestTokenSale {
    
    address admin;
    TestToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(
        address _buyer,
        uint256 _amount
    );

    constructor(TestToken _tokenContract, uint256 _tokenPrice) public {
        
        // assign an admin
        admin = msg.sender;

        // token contract
        tokenContract = _tokenContract;

        // token price
        tokenPrice = _tokenPrice;
    }

    // Buy Tokens
    function buyToken(uint256 _numberOfTokens) public payable {

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }
}