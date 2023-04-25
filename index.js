import { LBPairABI } from "@traderjoe-xyz/sdk-v2";
import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { fileURLToPath } from 'url';

dotenv.config();

const { parsed: { ACCOUNT, PROVIDER, GRAPHQL_ENDPOINT }} = dotenv.config();

const provider = new ethers.JsonRpcProvider(PROVIDER);

// GraphQL query to get users Joe positions
export async function getLiquidityPositions({ onlyActive = false, ACCOUNT }) {
  let userBinLiquidities = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      query: `query Position {
            liquidityPositions(where: {user: "${ACCOUNT}"}) {
              id
              binsCount
              timestamp
              block
              userBinLiquidities {
                liquidity
                binId
              }
              lbPair {
                id
                name
                tokenY {
                    decimals
                    name
                  }
                tokenX {
                    decimals
                    name
                  }
                tokenXPriceUSD
                tokenYPriceUSD
              }
            }
          }`,
    }),
  });
  const {
    data: { liquidityPositions },
  } = await userBinLiquidities.json();
  if (onlyActive) {
    return liquidityPositions.filter((position) => position.binsCount > 0);
  }
  return liquidityPositions;
}

export const getClaimableFees = async () => {
  const LiquidityPosition = await getLiquidityPositions({ onlyActive: true, ACCOUNT });
  // loop through each position async and get the pending fees
  const positions = LiquidityPosition.map(
    async ({ lbPair, userBinLiquidities }) => {
      const lbPairContract = new ethers.Contract(
        lbPair.id,
        LBPairABI,
        provider
      );
      const userBinIds = userBinLiquidities.map((bin) => bin.binId * 1);
      const feeData = await lbPairContract.pendingFees(ACCOUNT, userBinIds);
      let token1 = BigNumber.from(feeData[0]).toString();
      let token2 = BigNumber.from(feeData[1]).toString();
      token1 = (token1 / 10 ** lbPair.tokenX.decimals).toFixed(2) * 1;
      token2 = (token2 / 10 ** lbPair.tokenY.decimals).toFixed(2) * 1;
      let info = {
        Pool: `${lbPair.name}`,
        [lbPair.tokenX.name]: token1,
        [lbPair.tokenY.name]: token2,
        totalUSD:
          (
            token1 * lbPair.tokenXPriceUSD +
            token2 * lbPair.tokenYPriceUSD
          ).toFixed(2) * 1,
      };
      return info;
    }
  );
  return Promise.all(positions);
};
