// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @notice Freely mintable testnet ERC-721 with fully on-chain metadata and 5% ERC-2981 royalties.
/// Has no owner. Anyone can mint up to MAX_PER_MINT per call.
contract TestNFT is ERC721, ERC2981 {
    using Strings for uint256;

    uint256 public constant MAX_PER_MINT = 10;
    uint256 public totalSupply;

    error InvalidQuantity(uint256 quantity);

    string[6] private SHAPES = ["Circle", "Square", "Triangle", "Diamond", "Ring", "Cross"];

    constructor() ERC721("Devnads Test NFT", "DTNFT") {
        _setDefaultRoyalty(address(0xdead), 500);
    }

    function mint(address to, uint256 quantity) external {
        if (quantity == 0 || quantity > MAX_PER_MINT) revert InvalidQuantity(quantity);
        uint256 next = totalSupply;
        totalSupply = next + quantity;
        for (uint256 i = 1; i <= quantity; i++) {
            _mint(to, next + i);
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint256 seed = uint256(keccak256(abi.encode(address(this), tokenId)));
        uint256 hue = seed % 360;
        string memory shape = SHAPES[(seed >> 16) % SHAPES.length];
        string memory image = Base64.encode(bytes(_svg(tokenId, hue, shape)));
        string memory json = string.concat(
            '{"name":"Devnads Test NFT #', tokenId.toString(),
            '","description":"Freely mintable test NFT on Monad testnet. No value.",',
            '"image":"data:image/svg+xml;base64,', image,
            '","attributes":[{"trait_type":"Shape","value":"', shape,
            '"},{"trait_type":"Hue","display_type":"number","value":', hue.toString(), "}]}"
        );
        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    function _svg(uint256 tokenId, uint256 hue, string memory shape) private pure returns (string memory) {
        string memory fg = string.concat("hsl(", hue.toString(), ",80%,60%)");
        string memory bg = string.concat("hsl(", ((hue + 180) % 360).toString(), ",40%,12%)");
        string memory mark;
        bytes32 s = keccak256(bytes(shape));
        if (s == keccak256("Circle")) mark = string.concat('<circle cx="200" cy="180" r="90" fill="', fg, '"/>');
        else if (s == keccak256("Square")) mark = string.concat('<rect x="110" y="90" width="180" height="180" fill="', fg, '"/>');
        else if (s == keccak256("Triangle")) mark = string.concat('<polygon points="200,80 300,270 100,270" fill="', fg, '"/>');
        else if (s == keccak256("Diamond")) mark = string.concat('<polygon points="200,70 300,180 200,290 100,180" fill="', fg, '"/>');
        else if (s == keccak256("Ring")) mark = string.concat('<circle cx="200" cy="180" r="80" fill="none" stroke-width="28" stroke="', fg, '"/>');
        else mark = string.concat('<path d="M170 80h60v70h70v60h-70v70h-60v-70h-70v-60h70z" fill="', fg, '"/>');
        return string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="', bg, '"/>',
            mark,
            '<text x="200" y="360" font-family="monospace" font-size="24" fill="#fff" text-anchor="middle">#', tokenId.toString(), "</text></svg>"
        );
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
