// contracts/ImpactNFTFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ImpactNFT.sol";

/// @title Impact NFT Factory
/// @notice Deploys ImpactNFT collections, optionally one per business
contract ImpactNFTFactory {
    event CollectionCreated(address indexed business, address collection, string name, string symbol);

    /// @notice Deploy a new ImpactNFT collection
    /// @dev Current implementation creates the standard NourishNet Impact collection.
    ///      The `name` and `symbol` parameters are emitted for off-chain indexing and
    ///      can be used for future extensibility (e.g. per-business branding).
    function createCollection(string memory name, string memory symbol) external returns (address) {
        ImpactNFT collection = new ImpactNFT();
        emit CollectionCreated(msg.sender, address(collection), name, symbol);
        return address(collection);
    }
}

