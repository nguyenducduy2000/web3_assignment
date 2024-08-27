// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TokenB is ERC721 {
    uint256 public nextTokenId;
    mapping(address => uint256) public nftCounter; // Track the number of NFTs per user

    constructor() ERC721("TokenB", "TKB") {}

    function mintNFT(address recipient) external {
        uint256 tokenId = uint256(
            keccak256(abi.encodePacked(block.timestamp, recipient, nextTokenId))
        );
        _safeMint(recipient, tokenId);
        nftCounter[recipient]++;
        nextTokenId++;
    }

    function getNFTCount(address user) external view returns (uint256) {
        return nftCounter[user];
    }

    // function getTokenIdsByOwner(address owner) external view returns (uint256[] memory) {
    //     uint256 balance = balanceOf(owner);
    //     uint256[] memory tokenIds = new uint256[](balance);
    //     uint256 counter = 0;

    //     for (uint256 i = 0; i < nextTokenId; i++) {
    //         if (ownerOf(i) == owner) {
    //             tokenIds[counter] = i;
    //             counter++;
    //         }
    //     }

    //     return tokenIds;
    // }
}
