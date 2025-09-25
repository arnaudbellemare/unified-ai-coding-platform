// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./AgentWallet.sol";

/**
 * @title AgentWalletFactory
 * @dev Factory contract for creating AgentWallet instances
 * Uses Clone pattern for gas-efficient deployment
 */
contract AgentWalletFactory is Ownable, ReentrancyGuard {
    using Clones for address;
    
    // ============ STATE VARIABLES ============
    
    address public immutable agentWalletImplementation;
    mapping(string => address) public agentWallets;
    mapping(address => string) public walletToAgentId;
    address[] public allWallets;
    
    // ============ EVENTS ============
    
    event AgentWalletCreated(
        string indexed agentId,
        address indexed wallet,
        address indexed creator,
        uint256 timestamp
    );
    
    event AgentWalletDestroyed(
        string indexed agentId,
        address indexed wallet,
        address indexed destroyer,
        uint256 timestamp
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyValidAgentId(string memory agentId) {
        require(bytes(agentId).length > 0, "AgentWalletFactory: Empty agent ID");
        require(agentWallets[agentId] == address(0), "AgentWalletFactory: Agent wallet already exists");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        // Deploy the implementation contract
        agentWalletImplementation = address(new AgentWallet());
    }
    
    // ============ MAIN FUNCTIONS ============
    
    function createAgentWallet(
        string memory agentId,
        uint256 maxDailySpend,
        uint256 maxSingleTransaction,
        address[] memory allowedServices,
        address[] memory backupWallets,
        uint256 requiredApprovals,
        address[] memory recoveryContacts,
        uint256 recoveryDelay
    ) external onlyOwner nonReentrant onlyValidAgentId(agentId) returns (address) {
        // Validate inputs
        require(maxDailySpend > 0, "AgentWalletFactory: Invalid max daily spend");
        require(maxSingleTransaction > 0, "AgentWalletFactory: Invalid max single transaction");
        require(maxSingleTransaction <= maxDailySpend, "AgentWalletFactory: Single transaction exceeds daily limit");
        require(backupWallets.length >= requiredApprovals, "AgentWalletFactory: Insufficient backup wallets");
        require(requiredApprovals > 0, "AgentWalletFactory: Required approvals must be > 0");
        require(recoveryContacts.length > 0, "AgentWalletFactory: Recovery contacts required");
        require(recoveryDelay >= 1 days, "AgentWalletFactory: Recovery delay too short");
        
        // Clone the implementation
        address walletClone = agentWalletImplementation.clone();
        
        // Initialize the clone
        AgentWallet(walletClone).initialize(
            agentId,
            maxDailySpend,
            maxSingleTransaction,
            allowedServices,
            backupWallets,
            requiredApprovals,
            recoveryContacts,
            recoveryDelay
        );
        
        // Transfer ownership to the creator
        AgentWallet(walletClone).transferOwnership(msg.sender);
        
        // Store the mapping
        agentWallets[agentId] = walletClone;
        walletToAgentId[walletClone] = agentId;
        allWallets.push(walletClone);
        
        emit AgentWalletCreated(agentId, walletClone, msg.sender, block.timestamp);
        
        return walletClone;
    }
    
    function createAgentWalletWithDefaults(
        string memory agentId,
        address[] memory backupWallets,
        address[] memory recoveryContacts
    ) external onlyOwner nonReentrant onlyValidAgentId(agentId) returns (address) {
        // Default values for new agent wallets
        uint256 maxDailySpend = 10 * 10**6; // 10 USDC (6 decimals)
        uint256 maxSingleTransaction = 2 * 10**6; // 2 USDC (6 decimals)
        
        // Default allowed services (common API providers)
        address[] memory allowedServices = new address[](4);
        allowedServices[0] = 0x0000000000000000000000000000000000000001; // Placeholder for OpenAI
        allowedServices[1] = 0x0000000000000000000000000000000000000002; // Placeholder for Anthropic
        allowedServices[2] = 0x0000000000000000000000000000000000000003; // Placeholder for Perplexity
        allowedServices[3] = 0x0000000000000000000000000000000000000004; // Placeholder for Vercel
        
        uint256 requiredApprovals = 2; // Require 2 of N backup wallets to approve
        uint256 recoveryDelay = 7 days; // 7 day recovery delay
        
        return createAgentWallet(
            agentId,
            maxDailySpend,
            maxSingleTransaction,
            allowedServices,
            backupWallets,
            requiredApprovals,
            recoveryContacts,
            recoveryDelay
        );
    }
    
    function destroyAgentWallet(string memory agentId) external onlyOwner nonReentrant {
        address wallet = agentWallets[agentId];
        require(wallet != address(0), "AgentWalletFactory: Agent wallet not found");
        
        // Check if wallet has any remaining balance
        require(wallet.balance == 0, "AgentWalletFactory: Wallet has remaining balance");
        
        // Remove from mappings
        delete agentWallets[agentId];
        delete walletToAgentId[wallet];
        
        // Remove from allWallets array
        for (uint256 i = 0; i < allWallets.length; i++) {
            if (allWallets[i] == wallet) {
                allWallets[i] = allWallets[allWallets.length - 1];
                allWallets.pop();
                break;
            }
        }
        
        emit AgentWalletDestroyed(agentId, wallet, msg.sender, block.timestamp);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getAgentWallet(string memory agentId) external view returns (address) {
        return agentWallets[agentId];
    }
    
    function getAgentId(address wallet) external view returns (string memory) {
        return walletToAgentId[wallet];
    }
    
    function getAllWallets() external view returns (address[] memory) {
        return allWallets;
    }
    
    function getWalletCount() external view returns (uint256) {
        return allWallets.length;
    }
    
    function isAgentWallet(address wallet) external view returns (bool) {
        return bytes(walletToAgentId[wallet]).length > 0;
    }
    
    function getWalletInfo(string memory agentId) external view returns (
        address wallet,
        bool exists,
        uint256 balance
    ) {
        wallet = agentWallets[agentId];
        exists = wallet != address(0);
        if (exists) {
            balance = wallet.balance;
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function updateImplementation(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "AgentWalletFactory: Invalid implementation");
        // Note: This would require a more complex upgrade mechanism in production
        // For now, we'll keep the implementation immutable for security
        revert("AgentWalletFactory: Implementation is immutable");
    }
    
    function emergencyPauseAllWallets() external onlyOwner {
        for (uint256 i = 0; i < allWallets.length; i++) {
            try AgentWallet(allWallets[i]).emergencyPause() {
                // Successfully paused
            } catch {
                // Continue with other wallets
            }
        }
    }
    
    function emergencyUnpauseAllWallets() external onlyOwner {
        for (uint256 i = 0; i < allWallets.length; i++) {
            try AgentWallet(allWallets[i]).emergencyUnpause() {
                // Successfully unpaused
            } catch {
                // Continue with other wallets
            }
        }
    }
}
