# Test token contracts

Freely mintable, ownerless test tokens backing [devnads.com/tokens](https://devnads.com/tokens). Deployed on Monad testnet (10143) and verified on Monadscan and MonadVision.

| Contract | Address | Decimals | Max per mint |
| --- | --- | --- | --- |
| USDC (Test USD Coin) | `0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73` | 6 | 10,000 |
| USDT (Test Tether USD) | `0x42D54D7aE6776D309363e650fBcbF93D961D8b58` | 6 | 10,000 |
| WETH (Test Wrapped Ether) | `0x05bE0A4Bc7848424029B75d51565A34e17802D2d` | 18 | 5 |
| WBTC (Test Wrapped BTC) | `0x596886d5875D73cC9bCEC4fAf1EE54e4B8af3d6a` | 8 | 0.5 |
| DTNFT (Devnads Test NFT, ERC-721) | `0x26A784DfaF1e428aC51a5c1AE6E80E84278Af41D` | – | 10 |

```sh
pnpm install          # OpenZeppelin and forge-std come from node_modules
cd contracts && forge test
forge script script/Deploy.s.sol --rpc-url https://testnet-rpc.monad.xyz --private-key $PK --broadcast --slow
```
