const TestTokenSale = artifacts.require("./TestTokenSale.sol");
const TestToken = artifacts.require("./TestToken.sol");

// accounts are from ganache
contract("TestTokenSale", (accounts) => {
  let tokenSaleInstance;
  let tokenInstance;
  let admin = accounts[0];
  let tokenPrice = 10000000000000000; // wei
  let buyer = accounts[1];
  let tokenAvailable = 750000;
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
    return TestToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return TestTokenSale.deployed();
      })
      .then((instance) => {
        tokenSaleInstance = instance;

        // provision 75% of totla supply to the sale
        return tokenInstance.transfer(
          tokenSaleInstance.address,
          tokenAvailable,
          { from: admin }
        );
      })
      .then((receipt) => {
        return tokenSaleInstance.buyToken(numberOfTokens, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then((receipt) => {
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
        assert.equal(
          receipt.logs[0].args._amount,
          numberOfTokens,
          "Logs the number of tokens purchased"
        );

        return tokenSaleInstance.tokensSold();
      })
      .then((amount) => {
        assert.equal(
          amount.toNumber(),
          numberOfTokens,
          "increments the number of tokens sold"
        );

        return tokenInstance.balanceOf(buyer);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          numberOfTokens,
          "Should increase buyer tokens."
        );
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          tokenAvailable - numberOfTokens,
          "Should reduce contract balance."
        );
        return tokenSaleInstance.buyToken(numberOfTokens, {
          from: buyer,
          value: 1,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "Should fail when underpaying for token"
        );
        return tokenSaleInstance.buyToken(numberOfTokens, {
          from: buyer,
          value: 800000,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "Should fail when purchasing more tokens than available"
        );
      });
  });

  it("Ends token sale", () => {
    return TestToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return TestTokenSale.deployed();
      })
      .then((instance) => {
        tokenSaleInstance = instance;

        // try to end account from non admin account
        return tokenSaleInstance.endSale({ from: buyer });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "Should fail when trying to end sale with someone other than the admin"
        );
        return tokenSaleInstance.endSale({ from: admin });
      })
      .then((receipt) => {
        return tokenInstance.balanceOf(admin);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          999990,
          "Should return remaining balancing back to admin when ICO ends"
        );
      });
  });
});
