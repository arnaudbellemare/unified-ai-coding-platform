// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AgentWallet
 * @dev Simple smart contract for agent wallets on Base Sepolia testnet
 */
contract AgentWallet {
    address public owner;
    mapping(address => uint256) public balances;
    
    event Deposit(address indexed agent, uint256 amount);
    event Withdrawal(address indexed agent, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    function deposit(address agent) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        balances[agent] += msg.value;
        emit Deposit(agent, msg.value);
    }
    
    function withdraw(address agent, uint256 amount) external {
        require(balances[agent] >= amount, "Insufficient balance");
        balances[agent] -= amount;
        payable(agent).transfer(amount);
        emit Withdrawal(agent, amount);
    }
    
    function getBalance(address agent) external view returns (uint256) {
        return balances[agent];
    }
}
