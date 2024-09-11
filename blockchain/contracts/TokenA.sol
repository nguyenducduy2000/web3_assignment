// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenA is ERC20 {
    uint256 public constant TOTAL_SUPPLY = 1000000000 * 10 ** 18;
    uint256 public constant MAX_FAUCET_AMOUNT = 5000000 * 10 ** 18;
    uint256 public constant MAX_REWARD_AMOUNT = 1000000 * 10 ** 18;
    address public stakingContract;

    constructor() ERC20("TokenA", "TKA") {
        _mint(address(this), TOTAL_SUPPLY); // Mint tokens to the contract itself
    }

    // function setStakingContract(address _stakingContract) external {
    //     stakingContract = _stakingContract;
    // }

    // Allow the staking contract to transfer tokens from the contract's balance to the user
    function transferToUser(
        address recipient,
        uint256 amount
    ) external returns (bool) {
        require(recipient != address(0), "Transfer to the zero address");
        require(
            balanceOf(address(this)) >= amount,
            "Insufficient contract balance"
        );
        require(amount <= MAX_FAUCET_AMOUNT, "Amount exceeds maximum allowed");
        _transfer(address(this), recipient, amount);
        return true;
    }

    function transferReward(
        address to,
        uint256 amount
    ) external returns (bool) {
        require(
            amount <= MAX_REWARD_AMOUNT,
            "Staking: Amount exceeds maximum allowed"
        );
        require(
            balanceOf(address(this)) >= amount,
            "Faucet: Insufficient balance in contract"
        );
        // require(
        //     msg.sender == stakingContract,
        //     "Only staking contract can transferReward"
        // );
        _transfer(address(this), to, amount);
        return true;
    }
}
