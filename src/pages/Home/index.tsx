import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../layouts/Default";
import {
  Box,
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styled from "styled-components";
import NFTSaleActivityTable from "../../components/NFTSaleActivityTable";
import RankingList from "../../components/RankingList";
import { Stack } from "@mui/material";
import { getTokens } from "../../store/nftTokenSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import { getCollections } from "../../store/collectionSlice";
import { ARC200TokenI, ListedToken, ListingI, TokenI } from "../../types";
import { getSales } from "../../store/saleSlice";
import Marquee from "react-fast-marquee";
import CartNftCard from "../../components/CartNFTCard";
import { getPrices } from "../../store/dexSlice";
import { CTCINFO_LP_WVOI_VOI } from "../../contants/dex";
import { getListings } from "../../store/listingSlice";
import { getRankings } from "../../utils/mp";
import { CONTRACT, abi } from "ulujs";
import { getAlgorandClients } from "../../wallets";
import { custom, useWallet } from "@txnlab/use-wallet";
import { Button as MButton } from "@mui/material";
import algosdk, {
  getApplicationAddress,
  makeApplicationCallTxnFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
} from "algosdk";
import { toast } from "react-toastify";
import axios from "axios";
import { prepareString } from "../../utils/string";
import { arc200_balanceOf } from "ulujs/types/arc200";
import BigNumber from "bignumber.js";

const ActivityFilterContainer = styled.div`
  display: flex;
  align-items: flex-start;
  align-content: flex-start;
  gap: 10px var(--Main-System-10px, 10px);
  align-self: stretch;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    display: none;
  }
`;

const Button = styled.div`
  cursor: pointer;
`;

const Filter = styled(Button)`
  display: flex;
  padding: 6px 12px;
  justify-content: center;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
  border-radius: 100px;
  border: 1px solid #717579;
`;

const ActiveFilter = styled(Filter)`
  border-color: #93f;
  background: rgba(153, 51, 255, 0.2);
`;

const FilterLabel = styled.div`
  color: #717579;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Inter;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

const ActiveFilterLabel = styled(FilterLabel)`
  color: #93f;
`;

const SectionHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 45px;
  & h2.dark {
    color: #fff;
  }
  & h2.light {
    color: #93f;
  }
`;

const SectionTitle = styled.h2`
  /*color: #93f;*/
  text-align: center;
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Nohemi;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%; /* 40px */
`;

const SectionMoreButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  & a {
    text-decoration: none;
  }
  & button.button-dark {
    border: 1px solid #fff;
  }
  & button.button-dark::after {
    background: url("/arrow-narrow-up-right-dark.svg") no-repeat;
  }
  & div.button-text-dark {
    color: #fff;
  }
  & button.button-light {
    border: 1px solid #93f;
  }
  & button.button-light::after {
    background: url("/arrow-narrow-up-right-light.svg") no-repeat;
  }
  & div.button-text-light {
    color: #93f;
  }
`;

const SectionMoreButton = styled.button`
  /* Layout */
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  /* Style */
  border-radius: 100px;
  /* Shadow/XSM */
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.04);
  /* Style/Extra */
  background-color: transparent;
  &::after {
    content: "";
    width: 20px;
    height: 20px;
    position: relative;
    display: inline-block;
  }
`;

const SectionMoreButtonText = styled.div`
  /* Text Button/Semibold Large */
  font-family: "Inter", sans-serif;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px; /* 146.667% */
  letter-spacing: 0.1px;
  cursor: pointer;
`;

const SectionBanners = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 45px;
`;

function shuffleArray<T>(array: T[]): T[] {
  // Create a copy of the original array to avoid mutating the original array
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    // Generate a random index between 0 and i
    const randomIndex = Math.floor(Math.random() * (i + 1));
    // Swap elements between randomIndex and i
    [shuffledArray[i], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[i],
    ];
  }
  return shuffledArray;
}

interface ChannelCardProps {
  onClick: any;
  channel: any;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ onClick, channel: el }) => {
  const { activeAccount } = useWallet();
  const [balance, setBalance] = useState("");
  useEffect(() => {
    if (!activeAccount) return;
    const { address: addr } = activeAccount;
    const { algodClient, indexerClient } = getAlgorandClients();
    const ci = new CONTRACT(el.inTok, algodClient, indexerClient, abi.arc200, {
      addr,
      sk: new Uint8Array(0),
    });
    ci.arc200_balanceOf(addr).then((arc200_balanceOfR: any) => {
      if (!arc200_balanceOfR.success) return;
      setBalance(
        new BigNumber(arc200_balanceOfR.returnValue)
          .dividedBy(new BigNumber(10).pow(el.inTokDecimals))
          .toFixed(6)
      );
    });
  }, [activeAccount]);
  console.log({ balance });
  return (
    <TableRow>
      <TableCell>{el.chId}</TableCell>
      <TableCell>
        {balance} {el.inTokName}
      </TableCell>
      <TableCell>
        <Stack direction="column">
          <Box>{el.inTokName}</Box>
          <Link
            to={`https://shellyssandbox.xyz/#/token/${el.inTok}`}
            target="_blank"
          >
            {el.inTok}
          </Link>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack>
          <Box>{el.outTokName}</Box>
          <Link
            to={`https://shellyssandbox.xyz/#/token/${el.outTok}`}
            target="_blank"
          >
            {el.outTok}
          </Link>
        </Stack>
      </TableCell>
      <TableCell>
        <MButton
          onClick={async () => {
            if (!activeAccount) return;
            alert("Transfer");
            const { algodClient, indexerClient } = getAlgorandClients();
            const ci = new CONTRACT(
              6779767,
              algodClient,
              indexerClient,
              abi.arc200,
              {
                addr: activeAccount.address,
                sk: new Uint8Array(0),
              }
            );
            const arc200_transferR = await ci.arc200_transfer(
              0,
              "GFFT7TUFCGDN4I6VUWVQKDB5JOI733U3JLP2YOVERQWMWL5IEZVU2D7U5A"
            );
            if (!arc200_transferR.success) return;
            console.log({ arc200_transferR });
          }}
        >
          Transfer
        </MButton>
      </TableCell>
    </TableRow>
  );
};

export const Home: React.FC = () => {
  const { activeAccount, signTransactions, sendTransactions } = useWallet();
  const isLoading = false;
  return !isLoading ? (
    <Layout>
      <h2>Sandbox</h2>
      <Button
        onClick={async () => {
          if (!activeAccount) return;
          const { algodClient, indexerClient } = getAlgorandClients();
          const ci = new CONTRACT(
            29096344,
            algodClient,
            indexerClient,
            {
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
            },
            {
              addr: activeAccount.address,
              sk: new Uint8Array(0),
            }
          );
          const ci1 = new CONTRACT( // VIA
            6779767,
            algodClient,
            indexerClient,
            abi.arc200,
            {
              addr: activeAccount.address,
              sk: new Uint8Array(0),
            },
            true,
            false,
            true
          );
          const ci2 = new CONTRACT( // VRC200
            6778021,
            algodClient,
            indexerClient,
            abi.arc200,
            {
              addr: activeAccount.address,
              sk: new Uint8Array(0),
            },
            true,
            false,
            true
          );
          const buildN = [];
          buildN.push(
            ci1.arc200_transfer(
              "GFFT7TUFCGDN4I6VUWVQKDB5JOI733U3JLP2YOVERQWMWL5IEZVU2D7U5A",
              0
            )
          );
          buildN.push(
            ci2.arc200_transfer(
              "GFFT7TUFCGDN4I6VUWVQKDB5JOI733U3JLP2YOVERQWMWL5IEZVU2D7U5A",
              0
            )
          );
          const buildP = (await Promise.all(buildN)).map(({ obj }) => obj);
          buildP[0].payment = 28500;
          buildP[1].payment = 28500;
          console.log({ buildP });
          // const txns = [];
          // const suggestedParams = await algodClient.getTransactionParams().do();
          // txns.push(
          //   makePaymentTxnWithSuggestedParamsFromObject({
          //     from: activeAccount.address || "",
          //     to: getApplicationAddress(buildP[0].appIndex),
          //     amount: 28500,
          //     suggestedParams,
          //   })
          // );
          // txns.push(
          //   makeApplicationCallTxnFromObject({
          //     ...buildP[0],
          //     suggestedParams,
          //   })
          // );
          // txns.push(
          //   makePaymentTxnWithSuggestedParamsFromObject({
          //     from: activeAccount.address || "",
          //     to: getApplicationAddress(buildP[1].appIndex),
          //     amount: 28500,
          //     suggestedParams,
          //   })
          // );
          // txns.push(
          //   makeApplicationCallTxnFromObject({
          //     ...buildP[1],
          //     suggestedParams,
          //   })
          // );
          //ci.setExtraUTxns(txns)
          ci.setPaymentAmount(28500);
          ci.setExtraTxns(buildP);
          ci.setEnableGroupResourceSharing(true);
          const customR = await ci.custom();
          console.log({ customR });
          if (!customR.success) return;
          const customTxns = customR.txns.map(
            (el: string) => new Uint8Array(Buffer.from(el, "base64"))
          );
          console.log({ customTxns });

          await toast.promise(
            signTransactions(customTxns).then(sendTransactions),
            {
              pending: "Signing and sending transactions...",
              success: "Transactions sent!",
              error: "Error sending transactions",
            }
          );
        }}
      >
        Click
      </Button>
    </Layout>
  ) : (
    "Loading..."
  );
};
