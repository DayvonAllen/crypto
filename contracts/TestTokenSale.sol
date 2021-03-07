// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./TestToken.sol";

// ICO, how it works

// Provision tokens to token sale contract
// Set a token price in wei
// assign an admin
// buy tokens
// end sale

contract TestTokenSale {
    address payable admin;
    TestToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(TestToken _tokenContract, uint256 _tokenPrice) public {
        // assign an admin
        admin = msg.sender;

        // token contract
        tokenContract = _tokenContract;

        // token price
        tokenPrice = _tokenPrice;
    }

    // multiply helper
    // pure means it's not creating any transactions or reading and writing to the blockchain
    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    // Buy Tokens
    function buyToken(uint256 _numberOfTokens) public payable {
        //require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));

        // require contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

        //require successful transfer
        //when you use require it will revert if it doesn't happen
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        // sell token
        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    // ending token sale
    function endSale() public {
        // require only an admin can do it
        require(msg.sender == admin);

        // transfer remaining tokens back to admin
        // transfer allocated tokens back to the
        // token contract
        // address(this) is the current contract
        // converted to an address.
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );
        // destroy contract
        // selfdestruct - destroys the current contract, sending its funds to the given address
        //suicide(alias to self destruct)
        // when a contract is destroyed all of the state is going to be cleared out(variables)
        selfdestruct(admin);
    }
}
