const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

require("chai").use(require("chai-as-promised")).should();

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}
contract("Deploy Contract", ([deployer, investor]) => {
  let ethSwap, token;
  before(async () => {
    token = await Token.new();
    ethSwap = await EthSwap.new(token.address);

    let result = await token.transfer(ethSwap.address, tokens("1000000"));
  });
  describe("EthSwap Deploy", async () => {
    it("ethSwap has name", async () => {
      const name = await ethSwap.name();
      assert.equal(name, "EthSwap Instant Excahnge");
    });
    it("ethSwap has token", async () => {
      const tokenAmount = await token.balanceOf(ethSwap.address);
      assert.equal(tokenAmount.toString(), tokens("1000000"));
    });
    it("token has name", async () => {
      const name = await token.name();
      assert.equal(name, "DApp Token");
    });
  });

  describe("buyTokens()", async () => {
    let result;
    before(async () => {
      result = await ethSwap.buyTokens({
        from: investor,
        value: tokens("1"),
      });
    });
    it("allow user to buy tokens for fixed ether rate", async () => {
      // check investor balance
      let investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens("100"));
      // check ethSwap balance
      let ethSwapBalance;
      // check token balance
      ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("999900"));
      // check ether balance
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("1"));
      // check event is success
      const event = result.logs[0].args;
      // event event values
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100").toString());
      assert.equal(event.rate.toString(), "100");
    });
  });

  describe("sellTokens()", async () => {
    let result;
    before(async () => {
      await token.approve(ethSwap.address, tokens("100"), { from: investor });
      result = await ethSwap.sellTokens(tokens("100"), { from: investor });
    });
    it("allow user to sell tokens for fixed token rate", async () => {
      // check investor balance
      let investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens("0"));

      // check ethSwap balance
      let ethSwapBalance;
      // check token balance
      ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("1000000"));
      // check ether balance
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens("0"));

      const event = result.logs[0].args;
      // event event values
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100").toString());
      assert.equal(event.rate.toString(), "100");

      // FAILURE: investor can't sell more tokens than they have
      await ethSwap.sellTokens(tokens("500"), { from: investor }).should.be
        .rejected;
    });
  });
});
