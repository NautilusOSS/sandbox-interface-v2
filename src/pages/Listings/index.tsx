import React, { Suspense, useEffect, useMemo, useState } from "react";
import Layout from "../../layouts/Default";
import Section from "../../components/Section";
import { Box, Grid, Skeleton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axios from "axios";
//import { MarketplaceContext } from "../../store/MarketplaceContext";
import NftCard from "../../components/NFTCard";
import { decodePrice, decodeTokenId, getRankings } from "../../utils/mp";
import styled from "styled-components";
import NFTCollectionTable from "../../components/NFTCollectionTable";
import NFTSalesTable from "../../components/NFTSalesTable";
import NFTSaleActivityTable from "../../components/NFTSaleActivityTable";
import NFTListingTable from "../../components/NFTListingTable";
import RankingList from "../../components/RankingList";
import ToggleButtons from "../../components/RankingFilterToggleButtons";
import { Stack } from "@mui/material";
import { getTokens, updateToken } from "../../store/nftTokenSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import { getCollections } from "../../store/collectionSlice";
import {
  CollectionI,
  ListedToken,
  ListingI,
  RankingI,
  Token,
  TokenI,
} from "../../types";
import { getSales } from "../../store/saleSlice";
import { getPrices } from "../../store/dexSlice";
import { CTCINFO_LP_WVOI_VOI } from "../../contants/dex";
import { getListings } from "../../store/listingSlice";
//import NFTCard from "../../components/NFTCard2";
import { Search } from "@mui/icons-material";
import { useDebounceCallback } from "usehooks-ts";
import { lazy } from "react";

const NFTCard = lazy(() => import("../../components/NFTCard2"));

const PriceRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--Main-System-10px, 10px);
  align-self: stretch;
`;

const Min = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  flex: 1 0 0;
  /* Text M/Regular */
  font-family: Inter;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px; /* 146.667% */
  color: var(--text-icons-base-second, #68727d);
`;

const MinInputContainer = styled.div`
  display: flex;
  height: 20px;
  padding: 9px 12px;
  align-items: center;
  gap: var(--Main-System-8px, 8px);
  align-self: stretch;
  border-radius: var(--Roundness-Inside-M, 6px);
  /* Shadow/XSM */
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.04);
  &.dark {
    border: 1px solid #3b3b3b;
    background: #2b2b2b;
  }
  &.light {
    border: 1px solid var(--Stroke-Base, #eaebf0);
    background: var(--Background-Base-Main, #fff);
  }
`;

const MinInputLabelContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--Main-System-8px, 8px);
  flex: 1 0 0;
`;

const MinInputLabel = styled.div`
  flex: 1 0 0;
`;

const To = styled.div`
  color: #2b2b2b;
  /* Text M/Regular */
  font-family: Inter;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px; /* 146.667% */
`;

const Max = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  flex: 1 0 0;
`;

const SidebarFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
`;

const SidebarFilter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  margin-top: 24px;
`;

const SidebarLabel = styled.div`
  font-family: Nohemi;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 28px; /* 155.556% */
  flex-grow: 1;
  &.dark {
    color: #fff;
  }
  &.light {
    color: #161717;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
`;

const SearchLabel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
`;

const SearchInput = styled.div`
  display: flex;
  padding: var(--Main-System-10px, 10px) var(--Main-System-12px, 12px);
  align-items: center;
  gap: var(--Main-System-8px, 8px);
  align-self: stretch;
  border-radius: var(--Roundness-Inside-M, 6px);
  /* Shadow/XSM */
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.04);
  &.dark {
    border: 1px solid #3b3b3b;
    background: #2b2b2b;
  }
  &.light {
    border: 1px solid var(--Stroke-Base, #eaebf0);
    background: var(--Background-Base-Main, #fff);
  }
`;

const SearchIcon = styled.svg`
  width: var(--Main-System-16px, 16px);
  height: var(--Main-System-16px, 16px);
`;

const SearchPlaceholderText = styled.input`
  flex: 1 0 0;
  /* Text S/Medium */
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 142.857% */
  color: #68727d;
  &.dark.has-value {
    color: #fff;
  }
  &.light.has-value {
    color: #000;
  }
`;

const ListingRoot = styled.div`
  display: inline-flex;
  align-items: flex-start;
  gap: var(--Main-System-20px, 20px);
  margin-top: 44px;
`;

const SidebarFilterRoot = styled(Stack)`
  display: flex;
  width: 220px;
  padding: var(--Main-System-24px, 24px);
  /*
  flex-direction: column;
  align-items: flex-start;
  */
  gap: var(--Main-System-24px, 24px);
  border-radius: var(--Main-System-10px, 10px);
  flex-shrink: 0;
  &.dark {
    border: 1px solid #2b2b2b;
    background: #202020;
  }
  &.light {
    border: 1px solid #eaebf0;
    background: var(--Background-Base-Main, #fff);
  }
`;

const ListingContainer = styled.div`
  padding-top: 16px;
  overflow: hidden;
  flex-grow: 1;
`;

const ListingHeading = styled.div`
  display: flex;
  /*
  width: 955px;
  */
  justify-content: space-between;
  align-items: flex-start;
`;

const HeadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  /*
  gap: var(--Main-System-2px, 2px);
  */
  gap: 6px;
`;

const HeadingTitle = styled.div`
  text-align: center;
  font-family: Nohemi;
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: 40px; /* 83.333% */
  letter-spacing: 0.5px;
  &.dark {
    color: #fff;
  }
  &.light {
    color: #93f;
  }
`;

const HeadingDescriptionContainer = styled.div`
  display: flex;
  width: 174px;
  align-items: center;
  gap: var(--Main-System-8px, 8px);
`;

const HeadingDescription = styled.div`
  flex: 1 0 0;
  color: #93f;
  font-family: "Advent Pro";
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px; /* 120% */
  letter-spacing: 0.2px;
`;

const ListingGrid = styled.div`
  display: flex;
  /*
  width: 955px;
  */
  align-items: flex-start;
  align-content: flex-start;
  gap: 20px var(--Main-System-20px, 20px);
  flex-wrap: wrap;
  margin-top: 48px;
`;

// ------------------------------

const SectionDescription = styled.div`
  flex: 1 0 0;
  color: #93f;
  font-family: "Advent Pro";
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px; /* 120% */
  letter-spacing: 0.2px;
`;

const SectionHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  /*
  padding-top: 45px;
  */
  margin-top: 0px;
  gap: 10px;
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

export const Listings: React.FC = () => {
  /* Dispatch */
  const dispatch = useDispatch();
  /* Listings */
  const listings = useSelector((state: any) => state.listings.listings);
  const listingsStatus = useSelector((state: any) => state.listings.status);
  useEffect(() => {
    dispatch(getListings() as unknown as UnknownAction);
  }, [dispatch]);
  /* Dex */
  const prices = useSelector((state: RootState) => state.dex.prices);
  const dexStatus = useSelector((state: RootState) => state.dex.status);
  useEffect(() => {
    dispatch(getPrices() as unknown as UnknownAction);
  }, [dispatch]);
  const exchangeRate = useMemo(() => {
    if (!prices || dexStatus !== "succeeded") return 0;
    const voiPrice = prices.find((p) => p.contractId === CTCINFO_LP_WVOI_VOI);
    if (!voiPrice) return 0;
    return voiPrice.rate;
  }, [prices, dexStatus]);
  /* Tokens */
  const tokens = useSelector((state: any) => state.tokens.tokens);
  const tokenStatus = useSelector((state: any) => state.tokens.status);
  useEffect(() => {
    dispatch(getTokens() as unknown as UnknownAction);
  }, [dispatch]);

  /* Collections */
  const collections = useSelector(
    (state: any) => state.collections.collections
  );
  const collectionStatus = useSelector(
    (state: any) => state.collections.status
  );
  useEffect(() => {
    dispatch(getCollections() as unknown as UnknownAction);
  }, [dispatch]);
  /* Sales */
  const sales = useSelector((state: any) => state.sales.sales);
  const salesStatus = useSelector((state: any) => state.sales.status);
  useEffect(() => {
    dispatch(getSales() as unknown as UnknownAction);
  }, [dispatch]);

  /* Theme */
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  /* Router */
  const navigate = useNavigate();

  /* Toggle Buttons */
  const [selectedOption, setSelectedOption] = useState<string | null>("all");

  const handleOptionChange = (
    event: React.MouseEvent<HTMLElement>,
    newOption: string | null
  ) => {
    if (newOption !== null) {
      setSelectedOption(newOption);
    }
  };

  /* NFT Navigator Listings */
  // const [listings, setListings] = React.useState<any>(null);
  // React.useEffect(() => {
  //   try {
  //     const res = axios
  //       .get("https://arc72-idx.nftnavigator.xyz/nft-indexer/v1/mp/listings", {
  //         params: {
  //           active: true,
  //         },
  //       })
  //       .then(({ data }) => {
  //         setListings(data.listings);
  //       });
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }, []);

  const [search, setSearch] = useState<string>("");
  const [min, setMin] = useState<string>("");
  const [max, setMax] = useState<string>("");

  const debouncedSearch = useDebounceCallback(setSearch, 500);
  const debouncedMin = useDebounceCallback(setMin, 500);
  const debouncedMax = useDebounceCallback(setMax, 500);

  const normalListings = useMemo(() => {
    if (!listings || !exchangeRate) return [];
    return listings.map((listing: ListingI) => {
      return {
        ...listing,
        normalPrice:
          listing.currency === 0 ? listing.price : listing.price * exchangeRate,
      };
    });
  }, [listings, exchangeRate]);

  const filteredListings = useMemo(() => {
    const listings = normalListings.map((listing: ListingI) => {
      const nft = tokens.find(
        (t: TokenI) =>
          t.contractId === listing.collectionId && t.tokenId === listing.tokenId
      );
      const properties = nft?.metadata?.properties || {};
      const traitKeys = Object.keys(properties).join("").toLowerCase();
      const traitValues = Object.values(properties).join("").toLowerCase();
      let relevancy = 0;
      do {
        if (search) {
          if (
            nft?.metadata?.name?.toLowerCase().includes(search.toLowerCase())
          ) {
            relevancy +=
              256 -
              nft?.metadata?.name?.toLowerCase().indexOf(search.toLowerCase());
            break;
          }
          if (
            nft?.metadata?.description
              ?.toLowerCase()
              .includes(search.toLowerCase())
          ) {
            relevancy +=
              128 -
              nft?.metadata?.description
                ?.toLowerCase()
                .indexOf(search.toLowerCase());
            break;
          }
          if (traitKeys.indexOf(search) !== -1) {
            relevancy += 1;
            break;
          }
          if (traitValues.indexOf(search) !== -1) {
            relevancy += 1;
            break;
          }
        }
      } while (0);
      return {
        ...listing,
        nft,
        relevancy,
      };
    });
    if (search === "") {
      listings.sort((a: any, b: any) => b.round - a.round);
      return listings.filter(
        (el: any) =>
          el.price / 1e6 >= (min ? parseInt(min) : 0) &&
          el.price / 1e6 <= (max ? parseInt(max) : Number.MAX_SAFE_INTEGER)
      );
    } else {
      listings.sort((a: any, b: any) => b.relevancy - a.relevancy);
      return listings.filter(
        (el: any) =>
          el.relevancy > 0 &&
          el.price / 1e6 >= (min ? parseInt(min) : 0) &&
          el.price / 1e6 <= (max ? parseInt(max) : Number.MAX_SAFE_INTEGER)
      );
    }
  }, [normalListings, search, min, max]);

  const listedNfts = useMemo(() => {
    if (tokenStatus !== "succeeded") return [];
    const listedNfts: ListedToken[] =
      tokens
        ?.filter((nft: TokenI) => {
          return listings?.some(
            (listing: ListingI) =>
              `${listing.collectionId}` === `${nft.contractId}` &&
              `${listing.tokenId}` === `${nft.tokenId}`
          );
        })
        ?.map((nft: TokenI) => {
          const listing = listings.find(
            (l: ListingI) =>
              `${l.collectionId}` === `${nft.contractId}` &&
              `${l.tokenId}` === `${nft.tokenId}`
          );
          return {
            ...nft,
            listing: {
              ...listing,
              normalPrice:
                listing.currency === 0
                  ? listing.price
                  : listing.price * exchangeRate,
            },
          };
        }) || [];
    listedNfts.sort(
      (a: any, b: any) => b.listing.createTimestamp - a.listing.createTimestamp
    );
    return listedNfts;
  }, [tokenStatus, tokens, listings]);

  const listedCollections = useMemo(() => {
    if (collectionStatus !== "succeeded") return [];
    const listedCollections =
      collections
        ?.filter((c: any) => {
          return listedNfts?.some(
            (nft: any) => `${nft.contractId}` === `${c.contractId}`
          );
        })
        .map((c: any) => {
          return {
            ...c,
            tokens: listedNfts?.filter(
              (nft: any) => `${nft.contractId}` === `${c.contractId}`
            ),
          };
        }) || [];
    listedCollections.sort(
      (a: any, b: any) =>
        b.tokens[0].listing.createTimestamp -
        a.tokens[0].listing.createTimestamp
    );
    return listedCollections;
  }, [collectionStatus, collections, listedNfts]);

  const rankings: any = useMemo(() => {
    if (
      !sales ||
      !listings ||
      salesStatus !== "succeeded" ||
      collectionStatus !== "succeeded" ||
      tokenStatus !== "succeeded"
    )
      return new Map();
    return getRankings(tokens, collections, sales, listings, exchangeRate);
  }, [sales, tokens, collections, listings]);

  const isLoading = useMemo(
    () =>
      !listings ||
      !listedNfts ||
      !listedCollections ||
      !rankings ||
      listingsStatus !== "succeeded" ||
      tokenStatus !== "succeeded" ||
      collectionStatus !== "succeeded" ||
      salesStatus !== "succeeded",
    [
      listings,
      listedNfts,
      listedCollections,
      rankings,
      tokenStatus,
      collectionStatus,
      salesStatus,
    ]
  );

  return (
    <>
      <Layout>
        <ListingRoot>
          <SidebarFilterRoot
            className={isDarkTheme ? "dark" : "light"}
            sx={{
              display: { xs: "none", md: "block" },
            }}
          >
            <SearchContainer>
              <SearchInput className={isDarkTheme ? "dark" : "light"}>
                <SearchIcon
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <g clip-path="url(#clip0_1018_4041)">
                    <path
                      d="M14.6673 14.6667L11.6673 11.6667M13.334 7.33333C13.334 10.647 10.6477 13.3333 7.33398 13.3333C4.02028 13.3333 1.33398 10.647 1.33398 7.33333C1.33398 4.01962 4.02028 1.33333 7.33398 1.33333C10.6477 1.33333 13.334 4.01962 13.334 7.33333Z"
                      stroke="#68727D"
                      stroke-width="1.77778"
                      stroke-linecap="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1018_4041">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </SearchIcon>
                <SearchPlaceholderText
                  type="text"
                  className={[
                    search ? "has-value" : "",
                    isDarkTheme ? "dark" : "light",
                  ].join(" ")}
                  placeholder="Search"
                  onChange={(e) => {
                    if (e.target.value === "") setSearch("");
                    debouncedSearch(e.target.value);
                  }}
                />
              </SearchInput>
            </SearchContainer>
            <SidebarFilterContainer>
              <SidebarFilter>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "flex-start",
                    width: "100%",
                    gap: "12px",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M8.5 14.6667C8.5 15.9553 9.54467 17 10.8333 17H13C14.3807 17 15.5 15.8807 15.5 14.5C15.5 13.1193 14.3807 12 13 12H11C9.61929 12 8.5 10.8807 8.5 9.5C8.5 8.11929 9.61929 7 11 7H13.1667C14.4553 7 15.5 8.04467 15.5 9.33333M12 5.5V7M12 17V18.5M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke={isDarkTheme ? "white" : "black"}
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <SidebarLabel className={isDarkTheme ? "dark" : "light"}>
                    Price
                  </SidebarLabel>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 12H19"
                      stroke={isDarkTheme ? "white" : "black"}
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </Stack>
                <PriceRangeContainer>
                  <Min>
                    <MinInputContainer
                      className={isDarkTheme ? "dark" : "light"}
                    >
                      <MinInputLabelContainer>
                        <input
                          placeholder="Min"
                          onChange={(e) => {
                            if (
                              e.target.value === "" &&
                              isNaN(parseInt(e.target.value))
                            )
                              return;
                            debouncedMin(e.target.value);
                          }}
                          style={{
                            color: isDarkTheme ? "white" : "black",
                            width: "100%",
                          }}
                          type="text"
                        />
                      </MinInputLabelContainer>
                    </MinInputContainer>
                  </Min>
                  <To>to</To>
                  <Min>
                    <MinInputContainer
                      className={isDarkTheme ? "dark" : "light"}
                    >
                      <MinInputLabelContainer>
                        <input
                          placeholder="Max"
                          onChange={(e) => {
                            if (
                              e.target.value !== "" &&
                              isNaN(parseInt(e.target.value))
                            )
                              return;
                            debouncedMax(e.target.value);
                          }}
                          style={{
                            color: isDarkTheme ? "white" : "black",
                            width: "100%",
                          }}
                          type="text"
                        />
                      </MinInputLabelContainer>
                    </MinInputContainer>
                  </Min>
                </PriceRangeContainer>
              </SidebarFilter>
            </SidebarFilterContainer>
          </SidebarFilterRoot>
          <ListingContainer>
            <ListingHeading>
              <HeadingContainer>
                <HeadingTitle className={isDarkTheme ? "dark" : "light"}>
                  Buy
                </HeadingTitle>
                <HeadingDescriptionContainer>
                  <HeadingDescription>
                    // {filteredListings.length} Results
                  </HeadingDescription>
                </HeadingDescriptionContainer>
              </HeadingContainer>
            </ListingHeading>
            <ListingGrid>
              {filteredListings.slice(0).map((el: ListingI) => {
                const pk = `${el.mpContractId}-${el.mpListingId}`;
                const nft = tokens.find(
                  (t: TokenI) =>
                    t.contractId === el.collectionId && t.tokenId === el.tokenId
                );
                return (
                  <Suspense fallback={<div>Loading...</div>}>
                    <NFTCard
                      key={pk}
                      size="small"
                      nftName={
                        (nft?.metadata?.name || "").slice(0, 15)
                        //+
                        //(nft?.metadata?.name?.length || 0 > 13 ? "..." : "")
                      }
                      price={(el.price / 1e6).toLocaleString()}
                      currency={el.currency === 0 ? "VOI" : "VIA"}
                      image={
                        "https://prod.cdn.highforge.io/i/" +
                        encodeURIComponent(nft?.metadataURI || "") +
                        "?w=400"
                      }
                      onClick={() => {
                        navigate(
                          `/collection/${el.collectionId}/token/${el.tokenId}`
                        );
                      }}
                    />
                  </Suspense>
                );
              })}
            </ListingGrid>
          </ListingContainer>
        </ListingRoot>
        {/*!isLoading ? (
          <div>
            <SectionHeading>
              <SectionTitle className={isDarkTheme ? "dark" : "light"}>
                Listings
              </SectionTitle>
              <SectionDescription>
                // {filteredListings.length} results
              </SectionDescription>
            </SectionHeading>
            <NFTListingTable
              listings={normalListings}
              tokens={tokens}
              collections={collections}
            />
          </div>
        ) : (
          <div>
            <SectionHeading>
              <Skeleton variant="rounded" width={240} height={40} />
              <Skeleton variant="rounded" width={120} height={40} />
            </SectionHeading>
            <Grid container spacing={2} sx={{ mt: 5 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <Grid item xs={6} sm={4} md={3}>
                  <Skeleton
                    sx={{ borderRadius: 10 }}
                    variant="rounded"
                    width="100%"
                    height={469}
                  />
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={2} sx={{ mt: 5 }}>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="rounded" width="100%" height={240} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="rounded" width="100%" height={240} />
              </Grid>
            </Grid>
          </div>
              )*/}
      </Layout>
    </>
  );
};
