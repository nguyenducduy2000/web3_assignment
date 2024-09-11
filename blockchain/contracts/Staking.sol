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
    uint256 public constant LOCK_TIME = 30 seconds;
    uint256 public constant MINT_THRESHOLD = 1_000_000 * 10 ** 18; // 1M Token A
    uint256 public lockTimestamp;

    struct DepositInfo {
        uint256 counter;
        uint256 amount;
        uint256 reward;
        uint256 timestamp;
        uint256 nftDepositedTime;
        uint256 userAPR;
        uint256 totalDepositedAmount;
    }

    mapping(address => DepositInfo) public deposits;
    mapping(address => uint256[]) public depositedNFTs; // Track the NFTs deposited by the user
    mapping(address => uint256) public mintedNFTs;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event NFTMinted(address indexed user, uint256 tokenId);
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

        DepositInfo storage userDeposit = deposits[msg.sender];

        // If the user is depositing for the first time
        if (userDeposit.counter == 0) {
            // Set the user's APR to the base rate if it's not already set
            if (userDeposit.userAPR == 0) {
                userDeposit.userAPR = BASE_APR;
            }
            // Initialize the timestamp
            userDeposit.timestamp = block.timestamp;
        } else {
            // Update the reward with the time passed since the last deposit
            uint256 reward = calculateReward(msg.sender);
            userDeposit.reward += reward;
        }

        if (userDeposit.nftDepositedTime > 0) {
            userDeposit.nftDepositedTime = block.timestamp;
        }

        // Update the deposit info
        userDeposit.amount += _amount;
        userDeposit.totalDepositedAmount += _amount;
        userDeposit.counter += 1; // Increment the deposit/withdrawal counter
        // Update the timestamp
        userDeposit.timestamp = block.timestamp;
        lockTimestamp = block.timestamp + LOCK_TIME;

        // Mint NFT if the amount is above the mint threshold
        uint256 nftNumber = userDeposit.totalDepositedAmount /
            MINT_THRESHOLD -
            mintedNFTs[msg.sender];
        for (uint256 i = 0; i < nftNumber; i++) {
            uint256 tokenId = tokenB.mintNFT(msg.sender);
            emit NFTMinted(msg.sender, tokenId);
        }

        emit Deposited(msg.sender, _amount);
    }

    function withdraw() external {
        DepositInfo storage userDeposit = deposits[msg.sender];
        require(userDeposit.amount > 0, "No deposit found");
        // Ensure 5 minutes have passed since the last deposit
        require(block.timestamp >= lockTimestamp, "Tokens are still locked");

        // Update and claim all the reward before withdrawal
        uint256 reward = calculateReward(msg.sender) + userDeposit.reward;

        require(
            tokenA.transfer(msg.sender, userDeposit.amount),
            "Transfer amount failed"
        );

        require(
            tokenA.transferReward(msg.sender, reward),
            "Transfer reward failed"
        );

        emit Withdrawn(msg.sender, userDeposit.amount);
        emit RewardClaimed(msg.sender, reward);

        // @dev should remove this line later
        delete deposits[msg.sender];
    }

    function claimReward() external {
        DepositInfo storage userDeposit = deposits[msg.sender];
        require(userDeposit.amount > 0, "No deposit found");

        // Ensure 5 minutes have passed since the last deposit
        require(block.timestamp >= lockTimestamp, "Tokens are still locked");

        // Calculate the rewards since last timestamp
        uint256 reward = calculateReward(msg.sender) + userDeposit.reward;

        require(reward > 0, "No rewards available");

        // Transfer the rewards to the user
        require(
            tokenA.transferReward(msg.sender, reward),
            "Transfer reward failed"
        );

        // Reset the reward and update the timestamp
        userDeposit.reward = 0;
        userDeposit.timestamp = block.timestamp;

        if (userDeposit.nftDepositedTime > 0) {
            userDeposit.nftDepositedTime = block.timestamp;
        }

        emit RewardClaimed(msg.sender, reward);
    }

    // Deposit NFT to increase APR
    function depositNFT(uint256 tokenId) external {
        // Transfer the NFT from the user to the staking contract
        tokenB.transferFrom(msg.sender, address(this), tokenId);

        DepositInfo storage userDeposit = deposits[msg.sender];

        // Calculate the reward accumulated so far
        if (userDeposit.amount > 0) {
            uint256 reward = calculateReward(msg.sender);
            userDeposit.reward += reward;
        }

        // Increase user's APR by 2% for each NFT deposited
        userDeposit.userAPR += 2;

        // Update the nftDepositedTime
        userDeposit.nftDepositedTime = block.timestamp;

        // Track the deposited NFT
        depositedNFTs[msg.sender].push(tokenId);

        userDeposit.timestamp = block.timestamp;

        emit NFTDeposited(msg.sender, tokenId);
    }

    // Withdraw a specific NFT to decrease APR
    function withdrawNFT(uint256 tokenId) external {
        require(block.timestamp >= lockTimestamp, "Tokens are still locked!");

        require(_nftExists(msg.sender, tokenId), "NFT not deposited");

        // Transfer the NFT back to the user
        tokenB.transferFrom(address(this), msg.sender, tokenId);

        DepositInfo storage userDeposit = deposits[msg.sender];

        // Calculate the reward accumulated so far
        if (userDeposit.amount > 0) {
            uint256 rewardSinceLastNFTWithdraw = calculateReward(msg.sender);
            userDeposit.reward += rewardSinceLastNFTWithdraw;
        }

        // Decrease user's APR by 2% per withdrawn NFT, but not below the base APR
        if (userDeposit.userAPR > BASE_APR) {
            userDeposit.userAPR -= 2;
        }
        userDeposit.timestamp = block.timestamp;

        // Reset the nftDepositedTime after withdrawal
        userDeposit.nftDepositedTime = block.timestamp;

        // Remove the NFT from the user's deposited list
        _removeNFT(msg.sender, tokenId);

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

    function calculateReward(address user) public view returns (uint256) {
        DepositInfo memory userDeposit = deposits[user];
        if (userDeposit.amount == 0) return 0;

        uint256 timeStaked = block.timestamp - userDeposit.timestamp; // timeStaked = now - previous deposit time
        uint256 userSpecificAPR = userDeposit.userAPR > 0
            ? userDeposit.userAPR
            : BASE_APR; // either BASE_APR or user specific APR

        uint256 baseReward;
        uint256 bonusReward;

        uint256 nftDepositTimestamp = userDeposit.nftDepositedTime; // NFT deposit timestamp
        if (nftDepositTimestamp > 0) {
            // Base reward before NFT deposit
            baseReward = Math.mulDiv(
                userDeposit.amount *
                    BASE_APR *
                    (nftDepositTimestamp - userDeposit.timestamp),
                1,
                365 days * 100
            );

            // Bonus reward after NFT deposit using a higher APR
            bonusReward = Math.mulDiv(
                userDeposit.amount *
                    userSpecificAPR *
                    (block.timestamp - nftDepositTimestamp),
                1,
                365 days * 100
            );
        } else {
            // No NFT deposited yet, calculate base reward only
            baseReward = Math.mulDiv(
                userDeposit.amount * BASE_APR * timeStaked,
                1,
                365 days * 100
            );
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

    function getDepositedNFTs(
        address user
    ) external view returns (uint256[] memory) {
        return depositedNFTs[user];
    }
}
