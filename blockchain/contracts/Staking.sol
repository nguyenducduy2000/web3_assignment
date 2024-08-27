// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenA.sol";
import "./TokenB.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Staking {
    TokenA public tokenA;
    TokenB public tokenB;
    uint256 public constant BASE_APR = 8; // 8% annual return
    uint256 public constant LOCK_TIME = 5 minutes;
    // uint256 public constant MINT_THRESHOLD = 1_000_000 * 10 ** 18; // 1M Token A
    uint256 public constant MINT_THRESHOLD = 10000;

    struct DepositInfo {
        uint256 counter;
        uint256 amount;
        uint256 reward;
        uint256 timestamp;
        uint256 nftDepositedTime;
    }

    mapping(address => DepositInfo) public deposits;
    mapping(address => uint256) public rewardClaimed;
    mapping(address => uint256) public userAPR; // Track individual APR per user
    mapping(address => uint256[]) public depositedNFTs; // Track the NFTs deposited by the user

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event NFTMinted(address indexed user);
    event NFTDeposited(address indexed user, uint256 tokenId);
    event NFTWithdrawn(address indexed user, uint256 tokenId);

    constructor(address _tokenA, address _tokenB) {
        tokenA = TokenA(_tokenA);
        tokenB = TokenB(_tokenB);
    }

    function deposit(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");

        // Transfer tokens from user to the staking contract
        require(
            tokenA.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        // Mint NFT if the amount is above the mint threshold
        if (_amount >= MINT_THRESHOLD) {
            tokenB.mintNFT(msg.sender);
            emit NFTMinted(msg.sender);
        }

        DepositInfo storage userDeposit = deposits[msg.sender];

        // If the user is depositing for the first time
        if (userDeposit.counter == 0) {
            // Set the user's APR to the base rate if it's not already set
            if (userAPR[msg.sender] == 0) {
                userAPR[msg.sender] = BASE_APR;
            }
            // Initialize the timestamp
            userDeposit.timestamp = block.timestamp;
        } else {
            // Update the reward with the time passed since the last deposit
            uint256 rewardSinceLastDeposit = calculateReward(msg.sender);
            userDeposit.reward += rewardSinceLastDeposit;
            // Update the timestamp
            userDeposit.timestamp = block.timestamp;
        }

        // Update the deposit info
        userDeposit.amount += _amount;
        userDeposit.counter += 1; // Increment the deposit/withdrawal counter

        emit Deposited(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        DepositInfo storage userDeposit = deposits[msg.sender];
        require(userDeposit.amount > 0, "No deposit found");
        require(
            _amount > 0 && _amount <= userDeposit.amount,
            "Invalid withdrawal amount"
        );

        // Ensure 5 minutes have passed since the last deposit
        require(
            block.timestamp >= userDeposit.timestamp + LOCK_TIME,
            "You must wait 5 minutes after depositing before withdrawing."
        );

        // Update and claim all the reward before withdrawal
        uint256 rewardSinceLastWithdraw = calculateReward(msg.sender);
        uint256 totalReward = userDeposit.reward + rewardSinceLastWithdraw;

        // Update user's reward
        userDeposit.reward = 0;
        userDeposit.timestamp = block.timestamp; // Update timestamp to current for future reward calculations

        // Total amount to transfer to user: principal + rewards
        uint256 totalWithdrawalAmount = _amount + totalReward;

        // Update the user's deposit balance
        userDeposit.amount -= _amount;

        // Increment the counter
        userDeposit.counter += 1;

        // Transfer the total tokens (withdraw amount + reward) back to the user
        tokenA.transferToUser(msg.sender, totalWithdrawalAmount);

        // If all tokens are withdrawn, delete the deposit entry
        if (userDeposit.amount == 0) {
            delete deposits[msg.sender];
        }

        emit Withdrawn(msg.sender, _amount);
        emit RewardClaimed(msg.sender, totalReward);
    }

    function claimReward() external {
        DepositInfo storage userDeposit = deposits[msg.sender];
        require(userDeposit.amount > 0, "No deposit found");

        // Ensure 5 minutes have passed since the last deposit
        require(
            block.timestamp >= userDeposit.timestamp + LOCK_TIME,
            "You must wait 5 minutes after depositing before claiming rewards."
        );

        // Calculate the rewards since last timestamp
        uint256 rewardSinceLastClaim = calculateReward(msg.sender);
        uint256 totalReward = userDeposit.reward + rewardSinceLastClaim;

        require(totalReward > 0, "No rewards available");

        // Reset the reward and update the timestamp
        userDeposit.reward = 0;
        userDeposit.timestamp = block.timestamp;

        rewardClaimed[msg.sender] += totalReward;

        // Transfer the rewards to the user
        tokenA.transferToUser(msg.sender, totalReward);

        emit RewardClaimed(msg.sender, totalReward);
    }

    // Deposit NFT to increase APR
    function depositNFT(uint256 tokenId) external {
        // Transfer the NFT from the user to the staking contract
        tokenB.transferFrom(msg.sender, address(this), tokenId);

        // Increase user's APR by 2% for each NFT deposited
        userAPR[msg.sender] += 2;

        // Track the time of the NFT information
        DepositInfo storage userDeposit = deposits[msg.sender];
        userDeposit.nftDepositedTime = block.timestamp;

        // Track the deposited NFT
        depositedNFTs[msg.sender].push(tokenId);

        emit NFTDeposited(msg.sender, tokenId);
    }

    // Withdraw a specific NFT to decrease APR
    function withdrawNFT(uint256 tokenId) external {
        require(_nftExists(msg.sender, tokenId), "NFT not deposited");

        // Transfer the NFT back to the user
        tokenB.transferFrom(address(this), msg.sender, tokenId);

        // Remove the NFT from the user's deposited list
        _removeNFT(msg.sender, tokenId);

        // Decrease user's APR by 2% per withdrawn NFT
        if (userAPR[msg.sender] > BASE_APR) {
            userAPR[msg.sender] -= 2;
        }

        DepositInfo storage userDeposit = deposits[msg.sender];
        userDeposit.nftDepositedTime = block.timestamp;

        emit NFTWithdrawn(msg.sender, tokenId);
    }

    // Function to check if a user has deposited a specific NFT
    function _nftExists(
        address user,
        uint256 tokenId
    ) internal view returns (bool) {
        uint256[] memory nfts = depositedNFTs[user];
        for (uint256 i = 0; i < nfts.length; i++) {
            if (nfts[i] == tokenId) {
                return true;
            }
        }
        return false;
    }

    // Function to remove an NFT from the user's deposited list
    function _removeNFT(address user, uint256 tokenId) internal {
        uint256[] storage nfts = depositedNFTs[user];
        for (uint256 i = 0; i < nfts.length; i++) {
            if (nfts[i] == tokenId) {
                nfts[i] = nfts[nfts.length - 1]; // Replace with last element
                nfts.pop(); // Remove last element
                break;
            }
        }
    }

    function getDepositedNFTs(
        address user
    ) external view returns (uint256[] memory) {
        return depositedNFTs[user];
    }
    /**
    Calculate reward using individual user APR
    should add more case about when user deposit NFT and calculate reward based on
    NFT deposited timestamp. For example:
    uint256 deposited timestamp;
    if(NFT deposited timestamp > 0) {
        base reward = (base APR * time before deposit NFT timestamp * deposited amount) / (365 days * 10000)
        bonus reward = (bonus APR * time after deposit NFT timestamp * deposited amount) / (365 days * 10000) (note: 10000 is the time forward for testing)
        total reward = base reward + bonus reward
    } else if NFT is not deposited yet) {
        base reward = (base APR * time before deposit NFT timestamp * deposited amount) / (365 days * 100)
    }
    ** note: using Math contract (openzeppelin/contracts/utils/math/Math.sol) is advisable for calculation to avoid overflow
     */
    // Function to calculate reward using individual user APR
    // function calculateReward(address user) public view returns (uint256) {
    //     DepositInfo memory userDeposit = deposits[user];
    //     require(userDeposit.amount > 0, "No deposit found");

    //     uint256 timeStaked = block.timestamp - userDeposit.timestamp;
    //     uint256 userSpecificAPR = userAPR[user] > 0 ? userAPR[user] : BASE_APR;
    //     uint256 reward = (userDeposit.amount * userSpecificAPR * timeStaked) /
    //         (365 days * 100);

    //     return reward;
    // }

    function calculateReward(address user) public view returns (uint256) {
        DepositInfo memory userDeposit = deposits[user];
        require(userDeposit.amount > 0, "No deposit found");

        uint256 timeStaked = block.timestamp - userDeposit.timestamp;
        uint256 userSpecificAPR = userAPR[user] > 0 ? userAPR[user] : BASE_APR;

        uint256 baseReward;
        uint256 bonusReward;

        uint256 nftDepositTimestamp = userDeposit.nftDepositedTime;

        if (nftDepositTimestamp > 0) {
            // Time before NFT deposit
            uint256 timeBeforeNFT = Math.min(
                nftDepositTimestamp - userDeposit.timestamp,
                timeStaked
            );
            // Time after NFT deposit
            uint256 timeAfterNFT = timeStaked > timeBeforeNFT
                ? timeStaked - timeBeforeNFT
                : 0;

            // Base reward before NFT deposit
            baseReward = Math.mulDiv(
                userDeposit.amount * userSpecificAPR * timeBeforeNFT,
                1,
                365 days * 100
            );

            // Bonus reward after NFT deposit using a higher APR
            uint256 bonusAPR = userSpecificAPR + 2; // Example: 2% bonus for NFT staking
            bonusReward = Math.mulDiv(
                userDeposit.amount * bonusAPR * timeAfterNFT,
                1,
                365 days * 100
            );
        } else {
            // No NFT deposited yet, calculate base reward only
            baseReward = Math.mulDiv(userDeposit.amount * userSpecificAPR * timeStaked, 1, 365 days * 100);
        }

        uint256 totalReward = baseReward + bonusReward;

        return totalReward;
    }

    function getDepositInfo(
        address user
    ) external view returns (uint256 amount, uint256 timestamp) {
        DepositInfo memory userDeposit = deposits[user];
        return (userDeposit.amount, userDeposit.timestamp);
    }
}
