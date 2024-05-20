import { Container, Grid, Paper } from "@mui/material";
import React from "react";
import { swap } from "ulujs";
import { getAlgorandClients } from "../../wallets";
import { useWallet } from "@txnlab/use-wallet";
import { toast } from "react-toastify";

interface Asset {
  contractId: number;
  tokenId?: string | null;
  amount?: string;
  symbol?: string;
  decimals?: string;
}

export const Sandbox: React.FC = () => {
  const { activeAccount, signTransactions, sendTransactions } = useWallet();

  const handleSwap2 = async (poolId: number, A: Asset, B: Asset) => {
    if (!activeAccount || !A.amount || !B.symbol || !B.decimals) return;
    try {
      const { algodClient, indexerClient } = getAlgorandClients();
      const acc = {
        addr: activeAccount.address,
        sk: new Uint8Array(0),
      };
      const ci = new swap(poolId, algodClient, indexerClient, { acc });
      const swapR = await ci.swap(acc.addr, poolId, A, B);
      console.log(swapR);
      if (!swapR.success) {
        throw new Error("Swap failed");
      }
      await toast.promise(
        signTransactions(
          swapR.txns.map(
            (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
          )
        ).then(sendTransactions),
        {
          pending: "Signing transactions...",
          success: "Transactions signed!",
          error: "Error signing transactions",
        }
      );
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="Sandbox">
      <Container>
        <h2>Sandbox</h2>
        <a href="https://faucet.nautilus.sh/" target="_blank" rel="noreferrer">
          Voi Faucet
        </a>
        <Grid sx={{ my: 5 }} container spacing={2}>
          {[
            {
              category: "ARC200/ARC200",
              poolId: 47607661,
              tokAName: "VIA",
              tokAId: 6779767,
              tokBName: "VRC200",
              tokBId: 6778021,
              tokBDecimals: 8,
            },
            {
              category: "ARC200/ARC200",
              poolId: 47607661,
              tokAName: "VRC200",
              tokAId: 6778021,
              tokBName: "VIA",
              tokBId: 6779767,
              tokBDecimals: 6,
            },
            {
              category: "VOI/ARC200",
              poolId: 34099095,
              tokAName: "VOI",
              tokAId: 34099056,
              tokATokenId: "0",
              tokBName: "VIA",
              tokBId: 6779767,
              tokBDecimals: 6,
            },
            {
              category: "ARC200/VOI",
              poolId: 34099095,
              tokAName: "VIA",
              tokAId: 6779767,
              tokBName: "VOI",
              tokBId: 34099056,
              tokBTokenId: "0",
              tokBDecimals: 6,
            },
            // {
            //   category: "VSA/VOI Swap",
            //   poolId: 43013906,
            //   tokAName: "VOOP",
            //   tokAId: 43013692,
            //   tokATokenId: "6784778",
            //   tokBName: "VOI",
            //   tokBId: 34099056,
            //   tokBTokenId: "0",
            // },
            {
              category: "VSA/VOI",
              poolId: 43014415,
              tokAName: "VOOP",
              tokAId: 43014088,
              tokATokenId: "6784778",
              tokBName: "VOI",
              tokBId: 34099056,
              tokBTokenId: "0",
              tokBDecimals: 6,
            },
            {
              category: "VOI/VSA",
              poolId: 43014415,
              tokAName: "VOI",
              tokAId: 34099056,
              tokATokenId: "0",
              tokBName: "VOOP",
              tokBId: 43014088,
              tokBTokenId: "6784778",
              tokBDecimals: 6,
            },
            {
              category: "VSA/VSA",
              poolId: 47612043,
              tokAName: "VOOP",
              tokAId: 43014088,
              tokATokenId: "6784778",
              tokBName: "dVOI",
              tokBId: 47612038,
              tokBTokenId: "6543210",
              tokBDecimals: 6,
            },
            {
              category: "VSA/VSA",
              poolId: 47612043,
              tokAName: "dVOI",
              tokAId: 47612038,
              tokATokenId: "6543210",
              tokBName: "VOOP",
              tokBId: 43014088,
              tokBTokenId: "6784778",
              tokBDecimals: 6,
            },
            {
              category: "VSA/VSA",
              poolId: 47612137,
              tokAName: "VOOP",
              tokAId: 43014088,
              tokATokenId: "6784778",
              tokBName: "DEC0",
              tokBId: 47612133,
              tokBTokenId: "4432254",
              tokBDecimals: 0,
            },
            {
              category: "VSA/VSA",
              poolId: 47612137,
              tokAName: "DEC0",
              tokAId: 47612133,
              tokATokenId: "4432254",
              tokBName: "VOOP",
              tokBId: 43014088,
              tokBTokenId: "6784778",
              tokBDecimals: 6,
            },
            {
              category: "ARC200/VSA",
              poolId: 47612201,
              tokAName: "VIA",
              tokAId: 6779767,
              tokBName: "VOOP",
              tokBId: 43014088,
              tokBTokenId: "6784778",
              tokBDecimals: 6,
            },
            {
              category: "VSA/ARC200",
              poolId: 47612201,
              tokAName: "VOOP",
              tokAId: 43014088,
              tokATokenId: "6784778",
              tokBName: "VIA",
              tokBId: 6779767,
              tokBDecimals: 6,
            },
            {
              category: "VOI/VSA",
              poolId: 47612332,
              tokAName: "VOI",
              tokAId: 34099056,
              tokATokenId: "0",
              tokBName: "DEC0",
              tokBId: 47612133,
              tokBTokenId: "4432254",
              tokBDecimals: 0,
            },
          ].map((el) => (
            <Grid key={el.poolId} item xs={12} sm={6} md={4} lg={3}>
              <Paper elevation={5} sx={{ p: 5, borderRadius: 5 }}>
                <h3>{el.category} Swap</h3>
                <h4>
                  {el.tokAName}: {el.tokAId}
                </h4>
                <h4>
                  {el.tokBName}: {el.tokBId}
                </h4>
                <button
                  onClick={() => {
                    const amount = prompt("Enter amount");
                    if (!amount) return;
                    handleSwap2(
                      el.poolId,
                      {
                        contractId: el.tokAId,
                        tokenId: el.tokATokenId,
                        symbol: el.tokAName,
                        amount,
                      },
                      {
                        contractId: el.tokBId,
                        tokenId: el.tokBTokenId,
                        symbol: el.tokBName,
                        decimals: `${el.tokBDecimals || 0}`,
                      }
                    );
                  }}
                >
                  Swap
                </button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};
