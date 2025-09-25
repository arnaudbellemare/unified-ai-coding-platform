// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AgentWallet
 * @dev Smart contract wallet for autonomous AI agents with advanced security features
 * Implements ERC-4337 Account Abstraction with programmable spending rules
 */
contract AgentWallet is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    using SafeERC20 for IERC20;

    // ============ STRUCTS ============
    
    struct SpendingRule {
        bool isActive;
        uint256 maxDailySpend;
        uint256 maxSingleTransaction;
        uint256 dailySpent;
        uint256 lastResetDate;
        address[] allowedServices;
        mapping(address => bool) isAllowedService;
    }

    struct TransactionRequest {
        address to;
        uint256 value;
        bytes data;
        uint256 gasLimit;
        uint256 nonce;
        uint256 timestamp;
        bool executed;
    }

    struct RecoveryRequest {
        address newOwner;
        uint256 timestamp;
        bool approved;
        uint256 approvals;
        mapping(address => bool) hasApproved;
    }

    // ============ STATE VARIABLES ============
    
    string public agentId;
    SpendingRule public spendingRule;
    
    // Multi-signature backup wallets
    address[] public backupWallets;
    uint256 public requiredApprovals;
    mapping(address => bool) public isBackupWallet;
    
    // Recovery system
    address[] public recoveryContacts;
    uint256 public recoveryDelay;
    mapping(bytes32 => RecoveryRequest) public recoveryRequests;
    
    // Transaction management
    uint256 public nonce;
    mapping(bytes32 => TransactionRequest) public pendingTransactions;
    
    // USDC token address (Base network)
    IERC20 public constant USDC = IERC20(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913);
    
    // ============ EVENTS ============
    
    event AgentWalletCreated(string indexed agentId, address indexed wallet);
    event SpendingRuleUpdated(string indexed agentId, uint256 maxDailySpend, uint256 maxSingleTransaction);
    event TransactionExecuted(string indexed agentId, address indexed to, uint256 value, uint256 nonce);
    event RecoveryRequested(string indexed agentId, address indexed newOwner, uint256 timestamp);
    event RecoveryExecuted(string indexed agentId, address indexed oldOwner, address indexed newOwner);
    event BackupWalletAdded(string indexed agentId, address indexed backupWallet);
    event EmergencyPause(string indexed agentId, address indexed pauser);
    
    // ============ MODIFIERS ============
    
    modifier onlyAgentOrOwner() {
        require(
            msg.sender == owner() || 
            msg.sender == address(this), 
            "AgentWallet: Only agent or owner"
        );
        _;
    }
    
    modifier onlyBackupWallet() {
        require(isBackupWallet[msg.sender], "AgentWallet: Only backup wallet");
        _;
    }
    
    modifier validSpendingRule(uint256 amount) {
        require(spendingRule.isActive, "AgentWallet: Spending rule not active");
        require(amount <= spendingRule.maxSingleTransaction, "AgentWallet: Exceeds single transaction limit");
        
        // Check daily spending limit
        if (block.timestamp >= spendingRule.lastResetDate + 1 days) {
            spendingRule.dailySpent = 0;
            spendingRule.lastResetDate = block.timestamp;
        }
        
        require(
            spendingRule.dailySpent + amount <= spendingRule.maxDailySpend,
            "AgentWallet: Exceeds daily spending limit"
        );
        
        spendingRule.dailySpent += amount;
        _;
    }

    // ============ INITIALIZATION ============
    
    function initialize(
        string memory _agentId,
        uint256 _maxDailySpend,
        uint256 _maxSingleTransaction,
        address[] memory _allowedServices,
        address[] memory _backupWallets,
        uint256 _requiredApprovals,
        address[] memory _recoveryContacts,
        uint256 _recoveryDelay
    ) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        agentId = _agentId;
        nonce = 0;
        
        // Initialize spending rule
        spendingRule.isActive = true;
        spendingRule.maxDailySpend = _maxDailySpend;
        spendingRule.maxSingleTransaction = _maxSingleTransaction;
        spendingRule.dailySpent = 0;
        spendingRule.lastResetDate = block.timestamp;
        
        // Set allowed services
        for (uint256 i = 0; i < _allowedServices.length; i++) {
            spendingRule.allowedServices.push(_allowedServices[i]);
            spendingRule.isAllowedService[_allowedServices[i]] = true;
        }
        
        // Set backup wallets
        backupWallets = _backupWallets;
        requiredApprovals = _requiredApprovals;
        for (uint256 i = 0; i < _backupWallets.length; i++) {
            isBackupWallet[_backupWallets[i]] = true;
        }
        
        // Set recovery system
        recoveryContacts = _recoveryContacts;
        recoveryDelay = _recoveryDelay;
        
        emit AgentWalletCreated(_agentId, address(this));
    }

    // ============ SPENDING RULES ============
    
    function updateSpendingRule(
        uint256 _maxDailySpend,
        uint256 _maxSingleTransaction,
        address[] memory _allowedServices
    ) external onlyOwner {
        spendingRule.maxDailySpend = _maxDailySpend;
        spendingRule.maxSingleTransaction = _maxSingleTransaction;
        
        // Clear existing allowed services
        for (uint256 i = 0; i < spendingRule.allowedServices.length; i++) {
            spendingRule.isAllowedService[spendingRule.allowedServices[i]] = false;
        }
        delete spendingRule.allowedServices;
        
        // Set new allowed services
        for (uint256 i = 0; i < _allowedServices.length; i++) {
            spendingRule.allowedServices.push(_allowedServices[i]);
            spendingRule.isAllowedService[_allowedServices[i]] = true;
        }
        
        emit SpendingRuleUpdated(agentId, _maxDailySpend, _maxSingleTransaction);
    }
    
    function toggleSpendingRule() external onlyOwner {
        spendingRule.isActive = !spendingRule.isActive;
    }

    // ============ TRANSACTION EXECUTION ============
    
    function executeTransaction(
        address to,
        uint256 value,
        bytes memory data,
        uint256 gasLimit
    ) external onlyAgentOrOwner nonReentrant whenNotPaused validSpendingRule(value) returns (bool) {
        // Check if service is allowed
        require(spendingRule.isAllowedService[to], "AgentWallet: Service not allowed");
        
        // Execute transaction
        (bool success, ) = to.call{value: value, gas: gasLimit}(data);
        require(success, "AgentWallet: Transaction failed");
        
        // Update nonce
        nonce++;
        
        emit TransactionExecuted(agentId, to, value, nonce - 1);
        return true;
    }
    
    function executeBatchTransactions(
        address[] memory tos,
        uint256[] memory values,
        bytes[] memory datas,
        uint256[] memory gasLimits
    ) external onlyAgentOrOwner nonReentrant whenNotPaused {
        require(tos.length == values.length && values.length == datas.length && datas.length == gasLimits.length, "AgentWallet: Array length mismatch");
        
        uint256 totalValue = 0;
        for (uint256 i = 0; i < values.length; i++) {
            totalValue += values[i];
        }
        
        // Check total spending
        require(totalValue <= spendingRule.maxSingleTransaction, "AgentWallet: Batch exceeds single transaction limit");
        
        // Check daily spending
        if (block.timestamp >= spendingRule.lastResetDate + 1 days) {
            spendingRule.dailySpent = 0;
            spendingRule.lastResetDate = block.timestamp;
        }
        
        require(spendingRule.dailySpent + totalValue <= spendingRule.maxDailySpend, "AgentWallet: Batch exceeds daily spending limit");
        
        // Execute all transactions
        for (uint256 i = 0; i < tos.length; i++) {
            require(spendingRule.isAllowedService[tos[i]], "AgentWallet: Service not allowed");
            
            (bool success, ) = tos[i].call{value: values[i], gas: gasLimits[i]}(datas[i]);
            require(success, "AgentWallet: Batch transaction failed");
            
            emit TransactionExecuted(agentId, tos[i], values[i], nonce);
            nonce++;
        }
        
        spendingRule.dailySpent += totalValue;
    }

    // ============ RECOVERY SYSTEM ============
    
    function requestRecovery(address newOwner) external onlyBackupWallet {
        bytes32 requestId = keccak256(abi.encodePacked(agentId, newOwner, block.timestamp));
        
        RecoveryRequest storage request = recoveryRequests[requestId];
        request.newOwner = newOwner;
        request.timestamp = block.timestamp;
        request.approved = false;
        request.approvals = 1;
        request.hasApproved[msg.sender] = true;
        
        emit RecoveryRequested(agentId, newOwner, block.timestamp);
    }
    
    function approveRecovery(bytes32 requestId) external onlyBackupWallet {
        RecoveryRequest storage request = recoveryRequests[requestId];
        require(request.timestamp > 0, "AgentWallet: Recovery request not found");
        require(!request.hasApproved[msg.sender], "AgentWallet: Already approved");
        require(block.timestamp >= request.timestamp + recoveryDelay, "AgentWallet: Recovery delay not met");
        
        request.hasApproved[msg.sender] = true;
        request.approvals++;
        
        if (request.approvals >= requiredApprovals) {
            request.approved = true;
            _transferOwnership(request.newOwner);
            emit RecoveryExecuted(agentId, owner(), request.newOwner);
        }
    }
    
    function executeRecovery(bytes32 requestId) external onlyBackupWallet {
        RecoveryRequest storage request = recoveryRequests[requestId];
        require(request.approved, "AgentWallet: Recovery not approved");
        require(block.timestamp >= request.timestamp + recoveryDelay, "AgentWallet: Recovery delay not met");
        
        _transferOwnership(request.newOwner);
        emit RecoveryExecuted(agentId, owner(), request.newOwner);
    }

    // ============ EMERGENCY FUNCTIONS ============
    
    function emergencyPause() external onlyBackupWallet {
        _pause();
        emit EmergencyPause(agentId, msg.sender);
    }
    
    function emergencyUnpause() external onlyBackupWallet {
        _unpause();
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyBackupWallet {
        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }
    }

    // ============ UTILITY FUNCTIONS ============
    
    function getSpendingInfo() external view returns (
        bool isActive,
        uint256 maxDailySpend,
        uint256 maxSingleTransaction,
        uint256 dailySpent,
        uint256 lastResetDate
    ) {
        return (
            spendingRule.isActive,
            spendingRule.maxDailySpend,
            spendingRule.maxSingleTransaction,
            spendingRule.dailySpent,
            spendingRule.lastResetDate
        );
    }
    
    function getAllowedServices() external view returns (address[] memory) {
        return spendingRule.allowedServices;
    }
    
    function getBackupWallets() external view returns (address[] memory) {
        return backupWallets;
    }
    
    function getRecoveryContacts() external view returns (address[] memory) {
        return recoveryContacts;
    }
    
    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {
        // Allow receiving ETH for gas fees
    }
}
