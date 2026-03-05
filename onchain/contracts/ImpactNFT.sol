// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title NourishNet Impact NFT
/// @notice Minted automatically for each confirmed food rescue
contract ImpactNFT is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    event ImpactMinted(uint256 indexed tokenId, string uri, address indexed business, uint256 timestamp);
    event ImpactBurned(uint256 indexed tokenId, address indexed burner);

    constructor() ERC721("NourishNet Impact", "IMPACT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /// @notice Mint a new Impact NFT
    /// @param business Address of the donating business (receiver of NFT)
    /// @param metadataURI IPFS/Arweave URI containing impact details
    /// @return tokenId The minted token ID
    function mintImpact(address business, string memory metadataURI)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256)
    {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(business, tokenId);
        _setTokenURI(tokenId, metadataURI);
        emit ImpactMinted(tokenId, metadataURI, business, block.timestamp);
        return tokenId;
    }

    /// @notice Batch mint multiple NFTs (for efficiency)
    function batchMintImpact(
        address[] calldata businesses,
        string[] calldata metadataURIs
    ) external onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        require(businesses.length == metadataURIs.length, "Array length mismatch");
        uint256[] memory tokenIds = new uint256[](businesses.length);
        for (uint i = 0; i < businesses.length; i++) {
            tokenIds[i] = mintImpact(businesses[i], metadataURIs[i]);
        }
        return tokenIds;
    }

    /// @notice Burn an NFT (if needed, e.g., for retirement)
    function burn(uint256 tokenId) external onlyRole(BURNER_ROLE) {
        _burn(tokenId);
        emit ImpactBurned(tokenId, msg.sender);
    }

    /// @notice Add a new minter (e.g., Logistics Agent address)
    function addMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }

    /// @notice Revoke a minter
    function revokeMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, minter);
    }

    /// @notice Check if an address can mint
    function canMint(address account) external view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

