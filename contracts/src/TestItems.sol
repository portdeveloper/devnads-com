// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @notice Freely mintable testnet ERC-1155 with six item types and fully on-chain metadata.
/// Has no owner. Anyone can mint up to MAX_PER_MINT of each id per call.
contract TestItems is ERC1155 {
    using Strings for uint256;

    string public constant name = "Devnads Test Items";
    string public constant symbol = "DTITEM";
    uint256 public constant ITEM_COUNT = 6;
    uint256 public constant MAX_PER_MINT = 100;

    mapping(uint256 => uint256) public totalSupply;

    error InvalidId(uint256 id);
    error InvalidAmount(uint256 amount);

    string[6] private NAMES = ["Sword", "Shield", "Potion", "Gem", "Scroll", "Key"];
    string[6] private COLORS = ["#e5484d", "#3e63dd", "#30a46c", "#8e4ec6", "#f5d90a", "#f76b15"];

    constructor() ERC1155("") {}

    function mint(address to, uint256 id, uint256 amount) external {
        _check(id, amount);
        totalSupply[id] += amount;
        _mint(to, id, amount, "");
    }

    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata amounts) external {
        for (uint256 i = 0; i < ids.length; i++) {
            _check(ids[i], amounts[i]);
            totalSupply[ids[i]] += amounts[i];
        }
        _mintBatch(to, ids, amounts, "");
    }

    function uri(uint256 id) public view override returns (string memory) {
        if (id == 0 || id > ITEM_COUNT) revert InvalidId(id);
        string memory itemName = NAMES[id - 1];
        string memory svg = string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#111113"/>',
            '<rect x="60" y="60" width="280" height="280" rx="40" fill="none" stroke-width="16" stroke="', COLORS[id - 1], '"/>',
            '<text x="200" y="215" font-family="monospace" font-size="44" fill="#fff" text-anchor="middle">', itemName, "</text>",
            '<text x="200" y="370" font-family="monospace" font-size="20" fill="#888" text-anchor="middle">ID ', id.toString(), "</text></svg>"
        );
        string memory json = string.concat(
            '{"name":"', itemName,
            '","description":"Freely mintable ERC-1155 test item on Monad testnet. No value.",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)),
            '","attributes":[{"trait_type":"Item","value":"', itemName, '"}]}'
        );
        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    function _check(uint256 id, uint256 amount) private pure {
        if (id == 0 || id > ITEM_COUNT) revert InvalidId(id);
        if (amount == 0 || amount > MAX_PER_MINT) revert InvalidAmount(amount);
    }
}
