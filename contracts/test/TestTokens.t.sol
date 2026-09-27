// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {TestToken} from "../src/TestToken.sol";
import {TestNFT} from "../src/TestNFT.sol";

contract TestTokensTest is Test {
    TestToken usdc;
    TestNFT nft;
    address alice = address(0xA11CE);

    function setUp() public {
        usdc = new TestToken("Test USD Coin", "USDC", 6, 10_000e6);
        nft = new TestNFT();
    }

    function test_TokenMetadata() public view {
        assertEq(usdc.symbol(), "USDC");
        assertEq(usdc.decimals(), 6);
    }

    function test_AnyoneCanMintUpToCap() public {
        vm.prank(alice);
        usdc.mint(alice, 10_000e6);
        assertEq(usdc.balanceOf(alice), 10_000e6);
    }

    function test_RevertOverCap() public {
        vm.expectRevert(abi.encodeWithSelector(TestToken.MintCapExceeded.selector, 10_000e6 + 1, 10_000e6));
        usdc.mint(alice, 10_000e6 + 1);
    }

    function test_NftMintAndMetadata() public {
        vm.prank(alice);
        nft.mint(alice, 3);
        assertEq(nft.balanceOf(alice), 3);
        assertEq(nft.ownerOf(3), alice);
        assertEq(nft.totalSupply(), 3);
        string memory uri = nft.tokenURI(1);
        assertEq(bytes(uri).length > 100, true);
        (address receiver, uint256 royalty) = nft.royaltyInfo(1, 10_000);
        assertEq(receiver, address(0xdead));
        assertEq(royalty, 500);
    }

    function test_NftRevertBadQuantity() public {
        vm.expectRevert(abi.encodeWithSelector(TestNFT.InvalidQuantity.selector, 0));
        nft.mint(alice, 0);
        vm.expectRevert(abi.encodeWithSelector(TestNFT.InvalidQuantity.selector, 11));
        nft.mint(alice, 11);
    }
}

import {TestItems} from "../src/TestItems.sol";

contract TestItemsTest is Test {
    TestItems items;
    address alice = address(0xA11CE);

    function setUp() public {
        items = new TestItems();
    }

    function test_MintSingle() public {
        vm.prank(alice);
        items.mint(alice, 1, 100);
        assertEq(items.balanceOf(alice, 1), 100);
        assertEq(items.totalSupply(1), 100);
    }

    function test_MintBatch() public {
        uint256[] memory ids = new uint256[](3);
        uint256[] memory amounts = new uint256[](3);
        (ids[0], ids[1], ids[2]) = (1, 4, 6);
        (amounts[0], amounts[1], amounts[2]) = (5, 10, 1);
        items.mintBatch(alice, ids, amounts);
        assertEq(items.balanceOf(alice, 4), 10);
        assertEq(items.balanceOf(alice, 6), 1);
    }

    function test_RevertBadIdOrAmount() public {
        vm.expectRevert(abi.encodeWithSelector(TestItems.InvalidId.selector, 7));
        items.mint(alice, 7, 1);
        vm.expectRevert(abi.encodeWithSelector(TestItems.InvalidAmount.selector, 101));
        items.mint(alice, 1, 101);
        vm.expectRevert(abi.encodeWithSelector(TestItems.InvalidAmount.selector, 0));
        items.mint(alice, 1, 0);
    }

    function test_Uri() public view {
        assertGt(bytes(items.uri(3)).length, 100);
        assertTrue(items.supportsInterface(0xd9b67a26)); // ERC-1155
    }
}
