// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenA is ERC20 {
    constructor() ERC20("TokenA", "TKA") {
        _mint(address(this), 1000000000 * 10 ** decimals());  // Mint tokens to the contract itself
    }

    // Allow the staking contract to transfer tokens from the contract's balance to the user
    function transferToUser(address recipient, uint256 amount) external {
        require(recipient != address(0), "Transfer to the zero address");
        require(balanceOf(address(this)) >= amount, "Insufficient contract balance");
        _transfer(address(this), recipient, amount);
    }
    
    // Function for users to claim tokens from the supply
    function claimTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(address(this)) >= amount, "Insufficient supply in contract");
        
        // Transfer tokens to the user
        _transfer(address(this), msg.sender, amount);
    }
}
