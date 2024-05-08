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
import { useWallet } from "@txnlab/use-wallet";
import { Button as MButton } from "@mui/material";
import algosdk from "algosdk";
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
          onClick={() => {
            onClick(el);
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
  const [tokens, setTokens] = useState<ARC200TokenI[]>();
  useEffect(() => {
    axios.get(`/api/tokens.json`).then(({ data }) => {
      setTokens(
        data.map((el: any) => ({
          ...el,
          name: prepareString(el.name),
          symbol: prepareString(el.symbol),
        }))
      );
    });
  }, []);
  const [channels, setChannels] = useState<any[]>();
  useEffect(() => {
    if (!tokens) return;
    const { algodClient, indexerClient } = getAlgorandClients();
    const ctcInfoTunnel = 40425732;
    const ci = new CONTRACT(
      ctcInfoTunnel,
      algodClient,
      indexerClient,
      {
        name: "",
        desc: "",
        methods: [],
        events: [
          // ChannelCreate(uint256,uint64,uint64,address)
          {
            name: "ChannelCreate",
            args: [
              {
                name: "channelId",
                type: "uint256",
              },
              {
                name: "inTokenId",
                type: "uint64",
              },
              {
                name: "outTokenId",
                type: "uint64",
              },
              {
                name: "channelerAddress",
                type: "address",
              },
            ],
          },
        ],
      },
      {
        addr: "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ",
        sk: new Uint8Array(0),
      }
    );
    ci.ChannelCreate().then((evts: any) => {
      const channels = [];
      for (const evt of evts) {
        const [txId, round, ts, chId, inTok, outTok, channeller] = evt;
        const inTokeN = Number(inTok);
        const outTokN = Number(outTok);
        console.log({ tokens, inTok, outTok });
        const inToken = tokens?.find(
          (t: ARC200TokenI) => t.tokenId === inTokeN
        );
        console.log({ inToken });
        const inTokName = inToken?.symbol || "";
        const inTokDecimals = Number(inToken?.decimals || 0);
        const outTokName =
          tokens?.find((t: ARC200TokenI) => t.tokenId === outTokN)?.symbol ||
          "";
        channels.push({
          txId,
          round,
          ts,
          chId: Number(chId),
          inTok: inTokeN,
          inTokName,
          inTokDecimals,
          outTok: outTokN,
          outTokN,
          outTokName,
          channeller,
        });
      }
      setChannels(channels);
    });
  }, [tokens]);
  const handleButtonClick = async (channel: any) => {
    if (!channels || !activeAccount) return;
    try {
      const { algodClient, indexerClient } = getAlgorandClients();
      //const channel = channels[index];
      console.log({ channel });
      const { chId, inTok, outTok } = channel;
      const ctcInfoTunnel = 40425732;
      const ciInTok = new CONTRACT(
        inTok,
        algodClient,
        indexerClient,
        abi.arc200,
        {
          addr: activeAccount.address,
          sk: new Uint8Array(0),
        }
      );
      const ciOutTok = new CONTRACT(
        outTok,
        algodClient,
        indexerClient,
        abi.arc200,
        {
          addr: activeAccount.address,
          sk: new Uint8Array(0),
        }
      );
      const tunnelABI = {
        name: "",
        desc: "",
        methods: [
          // custom()void
          {
            name: "custom",
            args: [],
            returns: {
              type: "void",
            },
          },
          // a_channeler_useChannel(uint256,uint256)void
          {
            name: "a_channeler_useChannel",
            args: [
              {
                name: "channelId",
                type: "uint256",
              },
              {
                name: "tokenAmount",
                type: "uint256",
              },
            ],
            returns: {
              type: "void",
            },
          },
        ],
        events: [],
      };
      const ci = new CONTRACT(
        ctcInfoTunnel,
        algodClient,
        indexerClient,
        tunnelABI,
        {
          addr: activeAccount.address,
          sk: new Uint8Array(0),
        }
      );
      const builder = {
        inTok: new CONTRACT(
          inTok,
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
        ),
        outTok: new CONTRACT(
          outTok,
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
        ),
        tunnel: new CONTRACT(
          ctcInfoTunnel,
          algodClient,
          indexerClient,
          tunnelABI,
          {
            addr: activeAccount.address,
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        ),
      };
      // ---------------------------------------------
      // ensure
      // use channel
      // ---------------------------------------------
      // ensure
      // - ensure tunnel inToken balancce
      // - ensure approval inToken
      // - ensure balance outToken
      // ---------------------------------------------
      // - ensure tunnel inToken balancce
      // ---------------------------------------------
      do {
        const arc200_transferR = await ciInTok.arc200_transfer(
          algosdk.getApplicationAddress(ctcInfoTunnel),
          0
        );
        if (!arc200_transferR.success) {
          ciInTok.setPaymentAmount(28500);
          const arc200_transferR = await ciInTok.arc200_transfer(
            algosdk.getApplicationAddress(ctcInfoTunnel),
            0
          );
          if (!arc200_transferR.success)
            throw new Error("arc200_transfer failed");
          await toast.promise(
            signTransactions(
              arc200_transferR.txns.map(
                (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
              )
            ).then(sendTransactions),
            {
              pending: "Pending transaction...",
            }
          );
        }
      } while (0);
      // ---------------------------------------------
      // - ensure approval inToken
      // ---------------------------------------------
      do {
        const arc200_approveR = await ciInTok.arc200_approve(
          algosdk.getApplicationAddress(ctcInfoTunnel),
          0
        );
        if (!arc200_approveR.success) {
          ciInTok.setPaymentAmount(28100);
          const arc200_approveR = await ciInTok.arc200_approve(
            algosdk.getApplicationAddress(ctcInfoTunnel),
            0
          );
          if (!arc200_approveR.success)
            throw new Error("arc200_approve failed");
          await toast.promise(
            signTransactions(
              arc200_approveR.txns.map(
                (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
              )
            ).then(sendTransactions),
            {
              pending: "Pending transaction...",
            }
          );
        }
      } while (0);
      // ---------------------------------------------
      // - ensure balance outToken
      // ---------------------------------------------
      do {
        const arc200_transferR = await ciOutTok.arc200_transfer(
          activeAccount.address,
          0
        );
        if (!arc200_transferR.success) {
          ciOutTok.setPaymentAmount(28500);
          const arc200_transferR = await ciOutTok.arc200_transfer(
            activeAccount.address,
            0
          );
          if (!arc200_transferR.success)
            throw new Error("arc200_transfer failed");
          await toast.promise(
            signTransactions(
              arc200_transferR.txns.map(
                (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
              )
            ).then(sendTransactions),
            {
              pending: "Pending transaction...",
            }
          );
        }
      } while (0);
      // ---------------------------------------------
      // use channel
      // ---------------------------------------------

      const arc200_balanceOfR = await ciInTok.arc200_balanceOf(
        activeAccount.address
      );
      if (!arc200_balanceOfR) throw new Error("balanceOf failed");

      const channelId = chId;
      const exchangeAmount = arc200_balanceOfR.returnValue; // all holdings
      const buildN = [
        builder.inTok.arc200_approve(
          algosdk.getApplicationAddress(ctcInfoTunnel),
          exchangeAmount
        ),
        builder.tunnel.a_channeler_useChannel(channelId, exchangeAmount),
      ];
      const buildP = (await Promise.all(buildN)).map(({ obj }) => obj);

      ci.setFee(2000);
      ci.setExtraTxns(buildP);
      ci.setEnableGroupResourceSharing(true);
      ci.setAccounts([algosdk.getApplicationAddress(ctcInfoTunnel)]);
      const customR = await ci.custom();
      console.log({ customR });
      if (!customR.success) throw new Error("custom simulate failed");

      await toast.promise(
        signTransactions(
          customR.txns.map(
            (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
          )
        ).then(sendTransactions),
        {
          pending: "Pending transaction...",
        }
      );
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  const isLoading = !channels;
  return !isLoading ? (
    <Layout>
      <h2>Channels</h2>
      <p>
        Transfer button exchanges Token (In) for Token (Out). The exchange is
        irreversable. Use at your own risk.
      </p>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ChannelId</TableCell>
            <TableCell>Balance</TableCell>
            <TableCell>TokenId (In)</TableCell>
            <TableCell>TokenId (Out)</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {channels?.map((el, i) => (
            <ChannelCard key={i} onClick={handleButtonClick} channel={el} />
          ))}
        </TableBody>
      </Table>
    </Layout>
  ) : (
    "Loading..."
  );
};
