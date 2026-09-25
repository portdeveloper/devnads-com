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
