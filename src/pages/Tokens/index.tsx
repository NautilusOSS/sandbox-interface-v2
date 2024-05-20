import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../layouts/Default";
import {
  Box,
  Chip,
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

const formatter = Intl.NumberFormat("en", { notation: "compact" });

const StyledTableCell = (isDarkTheme: boolean) => styled(TableCell)`
  font-weight: 600;
  color: ${isDarkTheme ? "#fff" : "#000"} !important;
`;

export const Tokens: React.FC = () => {
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const TableCell = StyledTableCell(isDarkTheme);
  const navigator = useNavigate();
  const { activeAccount } = useWallet();
  const [tokens, setTokens] = useState<any[]>();
  const [balances, setBalances] = useState<any>();
  useEffect(() => {
    if (!activeAccount) return;
    axios
      .get(
        `https://arc72-idx.nautilus.sh/nft-indexer/v1/arc200/balances?accountId=${activeAccount?.address}`
      )
      .then(({ data }) => {
        const { balances } = data;
        balances.sort((a: any, b: any) => {
          return b.balance - a.balance;
        });
        setBalances(balances);
      });
  }, [activeAccount]);
  useEffect(() => {
    axios
      .get(`https://arc72-idx.nautilus.sh/nft-indexer/v1/arc200/tokens`)
      .then(({ data }) => {
        const tokens = data.tokens.map((el: any) => {
          const totalSupply = formatter.format(
            new BigNumber(el.totalSupply)
              .dividedBy(new BigNumber(10).pow(el.decimals))
              .toNumber()
          );
          return {
            ...el,
            totalSupply: ((str) =>
              str.length > 5 ? str.slice(0, 4) + "..." : str)(
              String(totalSupply)
            ),
            balance: new BigNumber(
              balances?.find(
                (balance: any) => balance.contractId === el.contractId
              )?.balance || "0"
            )
              .dividedBy(new BigNumber(10).pow(el.decimals))
              .toNumber(),
          };
        });
        tokens.sort((a: any, b: any) => {
          return balances?.length
            ? b.balance - a.balance
            : b.holders - a.holders;
        });
        setTokens(tokens);
      });
  }, [activeAccount, balances]);
  const isLoading = !tokens;
  return !isLoading ? (
    <Layout>
      <h2>
        Smart Assets{" "}
        <small style={{ fontSize: "16px" }}>
          // {tokens?.length ? `${tokens.length} results` : ""}
        </small>
      </h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Contract Id</TableCell>
            <TableCell>Minted</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Symbol</TableCell>
            <TableCell>Supply</TableCell>
            {activeAccount && balances?.length ? (
              <TableCell>Balance</TableCell>
            ) : null}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokens?.map((el, i) => (
            <TableRow>
              <TableCell>{el.contractId}</TableCell>
              <TableCell>{el.mintRound}</TableCell>
              <TableCell>
                <Box style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span>{el.name}</span>
                  {el.tokenId !== null ? (
                    <Chip
                      label="Wrapped Asset"
                      variant="outlined"
                      size="small"
                      style={{
                        color: "#fff",
                        borderColor: "#93f",
                        backgroundColor: "#93f",
                      }}
                    />
                  ) : null}
                </Box>
              </TableCell>
              <TableCell>{el.symbol}</TableCell>
              <TableCell>{el.totalSupply}</TableCell>
              {activeAccount && balances?.length ? (
                <TableCell>{el.balance.toLocaleString()}</TableCell>
              ) : null}
              <TableCell>
                <MButton
                  onClick={() => {
                    navigator(`/token/${el.contractId}`);
                  }}
                >
                  View
                </MButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Layout>
  ) : (
    "Loading..."
  );
};
