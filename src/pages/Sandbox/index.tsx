import { Container, Grid, Paper } from "@mui/material";
import React from "react";
import { CONTRACT, abi, swap } from "ulujs";
import { getAlgorandClients } from "../../wallets";
import { useWallet } from "@txnlab/use-wallet";
import algosdk from "algosdk";
import { toast } from "react-toastify";
import BigNumber from "bignumber.js";

const swapSpec = {
  name: "",
  desc: "",
  methods: [
    {
      name: "Trader_swapAForB",
      args: [{ type: "byte" }, { type: "uint256" }, { type: "uint256" }],
      returns: { type: "(uint256,uint256)" },
    },
    {
      name: "Trader_swapBForA",
      args: [{ type: "byte" }, { type: "uint256" }, { type: "uint256" }],
      returns: { type: "(uint256,uint256)" },
    },
    // {
    //   name: "Info",
    //   args: [],
    //   returns: {
    //     type: "((uint256,uint256),(uint256,uint256),(uint256,uint256,uint256,address,byte),(uint256,uint256),uint64,uint64)",
    //   },
    //   readonly: true,
    // },
  ],
  events: [],
};

const customSpec = {
  name: "",
  desc: "",
  methods: [
    {
      name: "custom",
      args: [],
      returns: {
        type: "void",
      },
    },
  ],
  events: [],
};

interface Asset {
  contractId: number;
  tokenId?: string | null;
  amount?: string;
  symbol?: string;
  decimals?: string;
}

export const Sandbox: React.FC = () => {
  const { activeAccount, signTransactions, sendTransactions } = useWallet();

  // const handleSwap1 = async (poolId: number, A: Asset, B: Asset) => {
  //   console.log({ poolId, A, B });
  //   if (!activeAccount || !A.amount || !B.symbol || !B.decimals) return;
  //   try {
  //     const { algodClient, indexerClient } = getAlgorandClients();
  //     const acc = {
  //       addr: activeAccount.address,
  //       sk: new Uint8Array(0),
  //     };
  //     const builder = {
  //       tokA: new CONTRACT(
  //         A.contractId,
  //         algodClient,
  //         indexerClient,
  //         abi.nt200,
  //         acc,
  //         true,
  //         false,
  //         true
  //       ),
  //       tokB: new CONTRACT(
  //         B.contractId,
  //         algodClient,
  //         indexerClient,
  //         abi.nt200,
  //         acc,
  //         true,
  //         false,
  //         true
  //       ),
  //       pool: new CONTRACT(
  //         poolId,
  //         algodClient,
  //         indexerClient,
  //         swapSpec,
  //         acc,
  //         true,
  //         false,
  //         true
  //       ),
  //     };
  //     const ciTokA = new CONTRACT(
  //       A.contractId,
  //       algodClient,
  //       indexerClient,
  //       abi.nt200,
  //       acc
  //     );
  //     const ciTokB = new CONTRACT(
  //       B.contractId,
  //       algodClient,
  //       indexerClient,
  //       abi.nt200,
  //       acc
  //     );
  //     const ciPool = new CONTRACT(
  //       poolId,
  //       algodClient,
  //       indexerClient,
  //       swapSpec,
  //       acc
  //     );
  //     const ciPoolRO = new swap(poolId, algodClient, indexerClient);

  //     const ci = new CONTRACT(
  //       poolId,
  //       algodClient,
  //       indexerClient,
  //       customSpec,
  //       acc
  //     );

  //     const infoR = await ciPoolRO.Info();
  //     if (!infoR.success) {
  //       console.log("info failed");
  //       return;
  //     }

  //     const info: any = infoR.returnValue;

  //     console.log({ info });

  //     if (
  //       !(
  //         (info.tokA === A.contractId && info.tokB === B.contractId) ||
  //         (info.tokA === B.contractId && info.tokB === A.contractId)
  //       )
  //     ) {
  //       throw new Error("Invalid pair");
  //     }

  //     const swapAForB = A.contractId == info.tokA && B.contractId == info.tokB;

  //     console.log({ swapAForB });

  //     const decAR = await ciTokA.arc200_decimals();
  //     if (!decAR.success) {
  //       console.log("decA failed");
  //       return;
  //     }
  //     const decA = Number(decAR.returnValue);

  //     console.log({ decA });

  //     const amtBi = BigInt(
  //       new BigNumber(A.amount).times(new BigNumber(10).pow(decA)).toFixed(0)
  //     );

  //     const balAR = await ciTokA.arc200_balanceOf(acc.addr);
  //     if (!balAR.success) {
  //       throw new Error("balA failed");
  //     }
  //     const balA = balAR.returnValue;
  //     const balBR = await ciTokB.arc200_balanceOf(acc.addr);
  //     if (!balBR.success) {
  //       throw new Error("balB failed");
  //     }
  //     const balB = balBR.returnValue;

  //     console.log({ amtBi, balA, balB });

  //     if (!A.tokenId && amtBi > balA) {
  //       throw new Error(
  //         `Swap abort insufficient ${A.symbol} balance (${new BigNumber(
  //           (balA - amtBi).toString()
  //         )
  //           .dividedBy(new BigNumber(10).pow(Number(decA)))
  //           .toFixed(Math.min(3, Number(decA)))} ${A.symbol})`
  //       );
  //     }

  //     let customR;
  //     for (const p4 of [0, 1]) {
  //       // 0 is withdraw with optin, 1 is withdraw without optin
  //       for (const p3 of [0, 28500]) {
  //         // 0 is deposit vsa without pmt, 28500 is deposit vsa with pmt
  //         for (const p2 of [0, 28500]) {
  //           // 0 is do not ensure balance, 28500 is ensure balance
  //           for (const p1 of [0, 28100]) {
  //             // 0 is do not approve, 28100 is approve
  //             const buildO = [];
  //             // -------------------------------------------
  //             // if vsa in
  //             //   1 axfer x
  //             //   1 deposit x
  //             // -------------------------------------------
  //             if (
  //               A.tokenId !== "0" &&
  //               !isNaN(Number(A.tokenId)) &&
  //               Number(A.tokenId) > 0
  //             ) {
  //               const obj1 = (await builder.tokA.deposit(amtBi)).obj;
  //               const payment = p3;
  //               const aamt = amtBi;
  //               const xaid = Number(A.tokenId);
  //               console.log({
  //                 ...obj1,
  //                 xaid,
  //                 aamt,
  //                 payment,
  //               });
  //               buildO.push({
  //                 ...obj1,
  //                 xaid,
  //                 aamt,
  //                 payment,
  //                 note: new TextEncoder().encode(
  //                   `Deposit ${new BigNumber(amtBi.toString()).dividedBy(
  //                     new BigNumber(10).pow(Number(decA)).toFixed(Number(decA))
  //                   )} ${
  //                     A.symbol
  //                   } to application address ${algosdk.getApplicationAddress(
  //                     A.contractId
  //                   )} from user address ${acc.addr}`
  //                 ),
  //               });
  //             }
  //             // -------------------------------------------
  //             // if voi/wvoi in
  //             //   1 pmt x
  //             //   1 deposit x
  //             // -------------------------------------------
  //             if (A.tokenId === "0") {
  //               // if (p3 > 0) {
  //               //   const obj0 = (await builder.tokA.createBalanceBox(acc.addr))
  //               //     .obj;
  //               //   const payment = p3;
  //               //   console.log({ obj0, payment });
  //               //   buildO.push({ ...obj0, payment });
  //               // }
  //               const obj1 = {
  //                 ...(await builder.tokA.deposit(amtBi)).obj,
  //                 payment: amtBi,
  //                 note: new TextEncoder().encode(
  //                   `Deposit ${new BigNumber(amtBi.toString()).dividedBy(
  //                     new BigNumber(10).pow(Number(decA)).toFixed(Number(decA))
  //                   )} ${
  //                     A.symbol
  //                   } to application address ${algosdk.getApplicationAddress(
  //                     A.contractId
  //                   )} from user address ${acc.addr}`
  //                 ),
  //               };
  //               buildO.push(obj1);
  //             }
  //             // -------------------------------------------
  //             // 1 pmt 28100
  //             // 1 approve x
  //             // -------------------------------------------
  //             do {
  //               const obj1 = (
  //                 await builder.tokA.arc200_approve(
  //                   algosdk.getApplicationAddress(poolId),
  //                   amtBi
  //                 )
  //               ).obj;
  //               const payment = p1;
  //               const note = new TextEncoder().encode(
  //                 `Approve ${new BigNumber(amtBi.toString()).dividedBy(
  //                   new BigNumber(10).pow(Number(decA)).toFixed(Number(decA))
  //                 )} ${
  //                   A.symbol
  //                 } to application address ${algosdk.getApplicationAddress(
  //                   poolId
  //                 )} from user address ${acc.addr}`
  //               );
  //               buildO.push({ ...obj1, payment, note });
  //             } while (0);
  //             // -------------------------------------------
  //             // 2 pmt 28500
  //             // 2 transfer 0
  //             // -------------------------------------------
  //             if (p2 > 0) {
  //               const obj2 = (
  //                 await builder.tokB.arc200_transfer(
  //                   algosdk.getApplicationAddress(poolId),
  //                   0
  //                 )
  //               ).obj;
  //               const payment = p2;
  //               const note = new TextEncoder().encode(
  //                 `Transfer 0 ${
  //                   B.symbol
  //                 } to application address ${algosdk.getApplicationAddress(
  //                   poolId
  //                 )} from user address ${acc.addr}`
  //               );
  //               buildO.push({ ...obj2, payment, note });
  //             }
  //             // -------------------------------------------
  //             // 3 swap
  //             // -------------------------------------------
  //             let whichOut;
  //             do {
  //               ciPool.setFee(4000); // fee to simulate swap
  //               const swapMethod = swapAForB
  //                 ? "Trader_swapAForB"
  //                 : "Trader_swapBForA";
  //               const sim = await ciPool[swapMethod](1, amtBi, 0);

  //               if (!sim.success) {
  //                 throw new Error("sim failed");
  //               }

  //               const [outA, outB] = sim.returnValue;

  //               whichOut = swapAForB ? outB : outA;

  //               console.log({ outA, outB });

  //               if (whichOut === BigInt(0)) {
  //                 throw new Error("Swap abort no return");
  //               }

  //               const obj3 = (
  //                 await builder.pool[swapMethod](0, amtBi, whichOut)
  //               ).obj;

  //               const outBSU = new BigNumber(whichOut).dividedBy(
  //                 new BigNumber(10).pow(Number(B.decimals))
  //               );

  //               const rateSU = outBSU.dividedBy(new BigNumber(A.amount));

  //               console.log({ rateSU });

  //               buildO.push({
  //                 ...obj3,
  //                 note: new TextEncoder().encode(
  //                   `Swap ${A.amount} ${A.symbol} for ${outBSU.toFixed(
  //                     Number(B.decimals)
  //                   )} ${B.symbol} (rate = ${rateSU.toFixed(6)} ${B.symbol}/${
  //                     A.symbol
  //                   }) from application address ${algosdk.getApplicationAddress(
  //                     poolId
  //                   )} to user address ${acc.addr}`
  //                 ),
  //               });
  //             } while (0);
  //             // -------------------------------------------
  //             // if voi/wvoi out
  //             //   1 withdraw y
  //             // -------------------------------------------
  //             if (!isNaN(Number(B.tokenId)) && Number(B.tokenId) >= 0) {
  //               const obj4 = {
  //                 ...(await builder.tokB.withdraw(whichOut)).obj,
  //                 note: new TextEncoder().encode(
  //                   `Withdraw ${new BigNumber(whichOut).dividedBy(
  //                     new BigNumber(10)
  //                       .pow(Number(B.decimals))
  //                       .toFixed(Number(B.decimals))
  //                   )} ${B.symbol}
  //                    from application address ${algosdk.getApplicationAddress(
  //                      B.contractId
  //                    )} to user address ${acc.addr}`
  //                 ),
  //               };
  //               const txn4 =
  //                 p4 > 0 && Number(B.tokenId) > 0
  //                   ? {
  //                       ...obj4,
  //                       xaid: Number(B.tokenId),
  //                       snd: acc.addr,
  //                       arcv: acc.addr,
  //                     }
  //                   : obj4;
  //               buildO.push(txn4);
  //             }
  //             // -------------------------------------------

  //             console.log({ buildO });

  //             ci.setFee(4000); // fee for custom
  //             ci.setExtraTxns(buildO);
  //             ci.setEnableGroupResourceSharing(true);
  //             const accounts = [algosdk.getApplicationAddress(poolId)];
  //             if (!isNaN(Number(A.tokenId)) && Number(A.tokenId) > 0) {
  //               accounts.push(algosdk.getApplicationAddress(A.contractId));
  //             }
  //             if (!isNaN(Number(B.tokenId)) && Number(B.tokenId) > 0) {
  //               accounts.push(algosdk.getApplicationAddress(B.contractId));
  //             }
  //             ci.setAccounts(accounts);
  //             customR = await ci.custom();
  //             console.log({ customR });
  //             if (!customR.success) {
  //               console.log(`custom failed skipping (${p1},${p2},${p3},${p4})`);
  //               continue;
  //             }
  //             console.log(`custom success (${p1},${p2},${p3},${p4})`);
  //             break;
  //           }
  //           if (customR.success) break;
  //         }
  //         if (customR.success) break;
  //       }
  //       if (customR.success) break;
  //     }
  //     console.log(customR);
  //     await toast.promise(
  //       signTransactions(
  //         customR.txns.map(
  //           (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
  //         )
  //       ).then(sendTransactions),
  //       {
  //         pending: "Signing transactions...",
  //         success: "Transactions signed!",
  //         error: "Error signing transactions",
  //       }
  //     );
  //   } catch (e: any) {
  //     toast.error(e.message);
  //   }
  // };

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
