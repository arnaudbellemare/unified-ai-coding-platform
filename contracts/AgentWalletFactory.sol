// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AgentWallet.sol";

/**
 * @title AgentWalletFactory
 * @dev Factory contract for creating agent wallets on Base Sepolia testnet
 */
contract AgentWalletFactory {
    mapping(address => address) public agentWallets;
    address[] public allAgents;
    
    event AgentWalletCreated(address indexed agent, address indexed wallet);
    
    function createWallet(address agent) external returns (address) {
        require(agentWallets[agent] == address(0), "Wallet already exists");
        
        AgentWallet wallet = new AgentWallet();
        agentWallets[agent] = address(wallet);
        allAgents.push(agent);
        
        emit AgentWalletCreated(agent, address(wallet));
        return address(wallet);
    }
    
    function getWallet(address agent) external view returns (address) {
        return agentWallets[agent];
    }
    
    function getAllAgents() external view returns (address[] memory) {
        return allAgents;
    }
}
