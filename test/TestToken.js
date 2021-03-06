const TestToken = artifacts.require("./TestToken.sol");

// accounts are from ganache
contract("TestToken", (accounts) => {
  let tokenInstance;

  it("Initializes the contract with the correct values", () => {
    return TestToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then((name) => {
        assert.equal(name, "Test Token", "Should set token name properly.");

        return tokenInstance.symbol();
      })
      .then((symbol) => {
        assert.equal(symbol, "TST", "Symbol should be set properly");
        return tokenInstance.standard();
      })
      .then((standard) => {
        assert.equal(
          standard,
          "Test Token v1.0",
          "Should set standard properly"
        );
      });
  });

  it("sets the total supply upon deployment", () => {
    return TestToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then((totalSupply) => {
        assert.equal(
          totalSupply.toNumber(),
          1000000,
          "Sets the total supply to 1,000,000"
        );
        return tokenInstance.balanceOf(accounts[0]).then((adminBalance) => {
          assert.equal(
            adminBalance.toNumber(),
            1000000,
            "initially all tokens should belong to admin"
          );
        });
      });
  });

  it("transfer token ownership", () => {
    return TestToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        // Test "require" statement first by transferring something larger than the sender's balance
        // .call doesn't create a transaction
        // .transfer does create a transacttion
        // and returns a transaction receipt
        return tokenInstance.transfer.call(accounts[1], 999999999999999999999);
      })
      .then(assert.fail)
      .catch((error) => {
        assert(error.fault === "overflow");
        return tokenInstance.transfer
          .call(accounts[1], 250000, {
            from: accounts[0],
          })
          .then((success) => {
            assert.equal(success, true, "Should transfer successfully");
            return tokenInstance.transfer(accounts[1], 250000, {
              from: accounts[0],
            });
          })
          .then((receipt) => {
            assert.equal(receipt.logs.length, 1, "triggers one event");
            assert.equal(
              receipt.logs[0].event,
              "Transfer",
              "Should be the 'Transfer' event"
            );
            assert.equal(
              receipt.logs[0].args._from,
              accounts[0],
              "correct from address"
            );
            assert.equal(
              receipt.logs[0].args._to,
              accounts[1],
              "correct to address"
            );
            assert.equal(receipt.logs[0].args._value, 250000, "correct value");
            return tokenInstance.balanceOf(accounts[1]);
          })
          .then((balance) => {
            assert.equal(
              balance.toNumber(),
              250000,
              "adds amount to receiving account"
            );
            return tokenInstance.balanceOf(accounts[0]);
          })
          .then((balance) => {
            assert.equal(
              balance.toNumber(),
              750000,
              "decreased sender's amount"
            );
          });
      });
  });

  it("It approves tokens for delegated transfer", () => {
    return TestToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        // call doesn't write data to the blockchain
        return tokenInstance.approve.call(accounts[1], 100);
      })
      .then((success) => {
        assert.equal(success, true, "Should return true");
        return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Approval",
          "Should be the 'Approval' event"
        );
        assert.equal(
          receipt.logs[0].args._owner,
          accounts[0],
          "correct from address"
        );
        assert.equal(
          receipt.logs[0].args._spender,
          accounts[1],
          "correct to address"
        );
        assert.equal(receipt.logs[0].args._value, 100, "correct value");
        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.equal(
          allowance.toNumber(),
          100,
          "stores allowance for delegated transfer"
        );
      });
  });

  it("Handles delegated token transfers", () => {
    return TestToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];
        // transfer some tokesn to fromAccount
        return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
      })
      .then((receipt) => {
        // approve spendingAccount to spend 10 tokens from fromAccount
        return tokenInstance.approve(spendingAccount, 10, {
          from: fromAccount,
        });
      })
      .then((receipt) => {
        // try transferring something larger than
        // sender's balance
        return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "Cannot spend more tokens than balance"
        );

        // try transferring something larger than the approved amount
        return tokenInstance.transferFrom(fromAccount, toAccount, 20, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "Cannot transfer more tokens than approved amount"
        );
        return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
          from: spendingAccount,
        });
      })
      .then((success) => {
        assert.equal(
          success,
          true,
          "Should return true if code is executed successfully"
        );

        return tokenInstance.transferFrom(fromAccount, toAccount, 10, {
          from: spendingAccount,
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          "Should be the 'Transfer' event"
        );
        assert.equal(
          receipt.logs[0].args._from,
          fromAccount,
          "correct from address"
        );
        assert.equal(receipt.logs[0].args._to, toAccount, "correct to address");
        assert.equal(receipt.logs[0].args._value, 10, "correct value");

        return tokenInstance.balanceOf(fromAccount);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          90,
          "Should deduct 10 tokens from the from accounts balance"
        );
        return tokenInstance.balanceOf(toAccount);
      })
      .then((balance) => {
        assert(
          balance.toNumber(),
          10,
          "Should increment toAccount's balance by 10"
        );
        return tokenInstance.allowance(fromAccount, spendingAccount);
      })
      .then((allowance) => {
        assert.equal(allowance, 0, "deducts amount from the allowance");
      });
  });
});
