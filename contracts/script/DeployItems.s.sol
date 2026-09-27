// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {TestItems} from "../src/TestItems.sol";

contract DeployItems is Script {
    function run() external {
        vm.startBroadcast();
        console.log("ITEMS", address(new TestItems()));
        vm.stopBroadcast();
    }
}
