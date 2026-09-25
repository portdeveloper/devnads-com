// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @notice Freely mintable testnet ERC-20 that mirrors a real token's name, symbol and decimals.
/// Has no owner. Anyone can mint up to `mintCap` per call. Worthless by design.
contract TestToken is ERC20, ERC20Permit {
    uint8 private immutable _decimals;
    uint256 public immutable mintCap;

    error MintCapExceeded(uint256 requested, uint256 cap);

    constructor(string memory name_, string memory symbol_, uint8 decimals_, uint256 mintCap_)
        ERC20(name_, symbol_)
        ERC20Permit(name_)
    {
        _decimals = decimals_;
        mintCap = mintCap_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external {
        if (amount > mintCap) revert MintCapExceeded(amount, mintCap);
        _mint(to, amount);
    }
}
