// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title On-chain configuration for NourishNet agents
/// @notice Stores tunable parameters that the DAO can update.
contract AgentConfig is AccessControl {
    bytes32 public constant CONFIG_UPDATER_ROLE = keccak256("CONFIG_UPDATER_ROLE");

    struct Config {
        uint256 scoutScanInterval; // seconds
        uint256 matchingRadius; // meters
        uint256 urgencyNgoBoost; // basis points
        uint256 urgencyExpiryBoost; // basis points
    }

    Config public config;

    event ConfigUpdated(Config newConfig);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // Initial sane defaults for early deployments.
        config = Config({
            scoutScanInterval: 1800,
            matchingRadius: 5000,
            urgencyNgoBoost: 100,
            urgencyExpiryBoost: 200
        });
    }

    function updateConfig(Config calldata newConfig) external onlyRole(CONFIG_UPDATER_ROLE) {
        config = newConfig;
        emit ConfigUpdated(newConfig);
    }

    function grantUpdaterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(CONFIG_UPDATER_ROLE, account);
    }
}

