// creates a contract abstration that truffle can use to run in a JS runtime environment.

// allows for us to interact with our smart contract in any runtime environment
const TestToken = artifacts.require("./TestToken.sol");
const TestTokenSale = artifacts.require("./TestTokenSale.sol");

// second arg is for constructor
module.exports = function (deployer) {
  deployer.deploy(TestToken, 1000000).then(() => {
    return deployer.deploy(TestTokenSale, TestToken.address, BigInt("10000000000000000"));
  });
};
