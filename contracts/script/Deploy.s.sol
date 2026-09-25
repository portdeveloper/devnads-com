// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {TestToken} from "../src/TestToken.sol";
import {TestNFT} from "../src/TestNFT.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        console.log("USDC", address(new TestToken("Test USD Coin", "USDC", 6, 10_000e6)));
        console.log("USDT", address(new TestToken("Test Tether USD", "USDT", 6, 10_000e6)));
        console.log("WETH", address(new TestToken("Test Wrapped Ether", "WETH", 18, 5e18)));
        console.log("WBTC", address(new TestToken("Test Wrapped BTC", "WBTC", 8, 0.5e8)));
        console.log("NFT", address(new TestNFT()));
        vm.stopBroadcast();
    }
}
