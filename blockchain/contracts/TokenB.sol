// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TokenB is ERC721 {
    uint256 public nextTokenId;
    mapping(address => uint256) public nftCounter; // Track the number of NFTs per user
    mapping(address => uint256[]) public myNFT;

    constructor() ERC721("TokenB", "TKB") {}

    function mintNFT(address recipient) external returns (uint256) {
        uint256 tokenId = nextTokenId;
        _safeMint(recipient, tokenId);
        myNFT[recipient].push(tokenId);
        nftCounter[recipient]++;
        nextTokenId++;
        return tokenId;
    }

    function getNFTCount(address user) external view returns (uint256) {
        return nftCounter[user];
    }
}
