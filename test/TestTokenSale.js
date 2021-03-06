const TestTokenSale = artifacts.require("./TestTokenSale.sol");

// accounts are from ganache
contract("TestTokenSale", (accounts) => {
  let tokenSaleInstance;
  let tokenPrice = 10000000000000000; // wei
  let buyer = accounts[1];
  let numberOfTokens = 10;


  it("Initializes the contract with the correct values", () => {
    return TestTokenSale.deployed()
      .then((instance) => {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "has a contract address");
        return tokenSaleInstance.tokenContract();
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "Has a token contract address");
        return tokenSaleInstance.tokenPrice();
      })
      .then((price) => {
        assert.equal(price, tokenPrice, "token price is correct");
      });
  });

  it("facilitates token buying", () => {
      return TestTokenSale.deployed().then((instance) => {
        tokenSaleInstance = instance;
        return tokenSaleInstance.buyToken(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice})
      }).then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Sell",
          "Should be the 'Sell' event"
        );
        assert.equal(
          receipt.logs[0].args._buyer,
          buyer,
          "logs the account that purchased the tokens"
        );
        assert.equal(receipt.logs[0].args._amount, numberOfTokens, "Logs the number of tokens purchased");
        
        return tokenSaleInstance.tokensSold();
      }).then((amount) => {
          assert.equal(amount.toNumber(), numberOfTokens, "increments the number of tokens sold");
      })
  })
});
