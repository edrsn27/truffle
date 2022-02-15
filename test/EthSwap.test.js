const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

 
contract("Deploy Contract", (accounts) => {
  let ethSwap, token;
  before(async () => {
    token = await Token.new();
    ethSwap = await EthSwap.new(token.address);
  });
  describe("EthSwap Deploy", async () => {
    it("contract has name", async () => {
      const name = await ethSwap.name();
      assert.equal(name, "EthSwap Instant Excahnge");
    });
  });
});
