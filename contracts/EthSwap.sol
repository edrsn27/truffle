pragma solidity ^0.5.0;
import "./Token.sol";

contract EthSwap {
    string public name = "EthSwap Instant Excahnge";
    uint256 public rate = 100;
    Token public token;

    event TokenPurchased(
        address account,
        address token,
        uint256 amount,
        uint256 rate
    );

    event TokenSold(
        address account,
        address token,
        uint256 amount,
        uint256 rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        // calculate the total amount of token
        uint256 tokenAmount = rate * msg.value;
        // check if ethswap has enough balance
        require(token.balanceOf(address(this)) >= tokenAmount);
        // transfer token
        token.transfer(msg.sender, tokenAmount);
        // emit event TokenPurchased
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint256 _amount) public {
        uint256 etherAmount = _amount / rate;
        require(address(this).balance >= etherAmount);
        // perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);
        // emit event TokenSold
        emit TokenSold(msg.sender, address(token), _amount, rate);
    }
}
