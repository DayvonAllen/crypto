// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// implements ERC20 specification
contract TestToken {
    // state variables are variables that are visible to the entire contract
    // every time we update this variable
    // it will write the change to the blockchain
    // Erc 20 standard mandatory
    uint256 public totalSupply;

    // address is person's address
    // address is the key
    // value is the unsigned integer
    // Erc 20 standard mandatory
    mapping(address => uint256) public balanceOf;

    // allowance map
    // the first address key is the owner account
    // the nested mapping could refer to any number of accounts that are allowed to
    // spend on the owner's behalf
    // the uint256 value is the allowance of tokens
    // allowance(Erc 20 token standard mandatory) is the allotted amount that we
    // have approved to be transferred or withdrawn on your behalf
    // approve amount gets stored in allowance
    mapping(address => mapping(address => uint256)) public allowance;

    // token name(Erc 20 standard optional)
    string public name = "Test Token";

    //token symbol(Erc 20 standard optional)
    string public symbol = "TST";

    //token standard
    string public standard = "Test Token v1.0";

    // contract should emit when transfer happens
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    // Should be emitted when approve method is
    // called(ERC 20 standard manadatory)
    // consumer can subscribe or listen to events
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // constructor
    constructor(uint256 _initialSupply) public {
        // msg is a global variable
        // it has various properties that you
        // can read from it
        // sender is the address that calls this
        // function
        // this is the admin's balance who will
        // send out th etokens
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
        // allocate the initial supply
    }

    // Transfer(ERC 20 standard mandatory)
    // should throw an exception if the from _from account
    // balance doesn't have enough tokens to
    // spend, returns a bool if successful
    // must trigger a transfer event
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // if sender doesn't have enough tokens
        // then throw error
        // if statement is true continue execution, if false stop execution, returns false and Any gas that has been used up to this point will be spent but
        // gas allocated for the rest of the execution after this code will be refunded.
        require(balanceOf[msg.sender] >= _value);

        // deducts currency from sender
        balanceOf[msg.sender] -= _value;
        // increases balance of _to address
        balanceOf[_to] += _value;

        //emit Transfer event
        emit Transfer(msg.sender, _to, _value);

        // returns true if transfer was successful.
        return true;
    }

    // Delegated transfer

    // approve(Erc 20 standard mandatory) allows an account to approve another account to spend tokens on its behalf
    // spender arg is the account that we want to approve to spend on our behalf
    // allows spender to withdraw from your account multiple times
    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        // allowance
        allowance[msg.sender][_spender] = _value;
        
        //approve event
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    // transferFrom(Erc 20 standard mandatory) allows contracts to transfer tokens on your behalf

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

        // require _from has enough tokens
        require(balanceOf[_from] >= _value);

        // require allowance is big enough
        require(allowance[_from][msg.sender] >= _value);

        // change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // update allowance
        allowance[_from][msg.sender] -= _value;

        // emit transfer event
        emit Transfer(_from, _to, _value);

        return true;
    }
}
