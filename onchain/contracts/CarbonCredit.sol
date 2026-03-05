// contracts/CarbonCredit.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title NourishNet Carbon Credit Token
/// @notice ERC20 token representing verified CO₂ savings (1 token = 1 kg CO₂)
contract CarbonCredit is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    event CreditsMinted(address indexed to, uint256 amount, uint256 indexed rescueId);
    event CreditsRetired(address indexed from, uint256 amount, string reason);

    constructor() ERC20("NourishNet Carbon Credit", "CRBN") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /// @notice Mint carbon credits for a rescue
    /// @param to Recipient (usually the business or NGO)
    /// @param amount Amount in kg CO₂ (1 token = 1 kg)
    /// @param rescueId Associated rescue ID for traceability
    function mintCredits(address to, uint256 amount, uint256 rescueId) 
        external 
        onlyRole(MINTER_ROLE) 
    {
        _mint(to, amount);
        emit CreditsMinted(to, amount, rescueId);
    }

    /// @notice Retire credits (remove from supply) – e.g., when offset is claimed
    function retireCredits(uint256 amount, string memory reason) external {
        _burn(msg.sender, amount);
        emit CreditsRetired(msg.sender, amount, reason);
    }

    /// @notice Batch mint for efficiency
    function batchMintCredits(
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256[] calldata rescueIds
    ) external onlyRole(MINTER_ROLE) {
        require(recipients.length == amounts.length && amounts.length == rescueIds.length, "Length mismatch");
        for (uint i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
            emit CreditsMinted(recipients[i], amounts[i], rescueIds[i]);
        }
    }

    /// @notice Add a minter
    function addMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }
}

