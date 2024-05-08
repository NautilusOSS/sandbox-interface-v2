import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../layouts/Default";
import { Grid, Skeleton, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axios from "axios";
import { getRankings } from "../../utils/mp";
import styled from "styled-components";
import NFTSaleActivityTable from "../../components/NFTSaleActivityTable";
import { ListedToken, ListingI, TokenI } from "../../types";
import { getSales } from "../../store/saleSlice";
import { getPrices } from "../../store/dexSlice";
import { CTCINFO_LP_WVOI_VOI } from "../../contants/dex";
import { UnknownAction } from "@reduxjs/toolkit";
import { getTokens } from "../../store/nftTokenSlice";
import { getListings } from "../../store/listingSlice";
import { getCollections } from "../../store/collectionSlice";

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

export const Activity: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string[]>(["all"]);
  const handleFilterClick = (value: string) => {
    if (value === "all") return setActiveFilter(["all"]);
    if (activeFilter.length === 1 && activeFilter.includes("all"))
      return setActiveFilter([value]);
    if (activeFilter.includes(value)) {
      const newActiveFilter = activeFilter.filter((filter) => filter !== value);
      if (newActiveFilter.length === 0) return setActiveFilter(["all"]);
      setActiveFilter(activeFilter.filter((filter) => filter !== value));
    } else {
      setActiveFilter([...activeFilter, value]);
    }
  };
  /* Dispatch */
  const dispatch = useDispatch();
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
  /* Listings */
  const listings = useSelector((state: any) => state.listings.listings);
  const listingsStatus = useSelector((state: any) => state.listings.status);
  useEffect(() => {
    dispatch(getListings() as unknown as UnknownAction);
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

  const isLoading = useMemo(
    () =>
      !listings ||
      // //!listedNfts ||
      //!listedCollections ||
      //!rankings ||
      tokenStatus !== "succeeded" ||
      collectionStatus !== "succeeded" ||
      salesStatus !== "succeeded" ||
      listingsStatus !== "succeeded",
    [
      listings,
      //listedNfts,
      //listedCollections,
      //rankings,
      tokenStatus,
      collectionStatus,
      salesStatus,
      listingsStatus,
    ]
  );
  return (
    <Layout>
      {!isLoading ? (
        <div>
          {/* Activity */}
          <SectionHeading>
            <Stack direction="row" spacing={2}>
              <SectionTitle className={isDarkTheme ? "dark" : "light"}>
                Activity
              </SectionTitle>
              <ActivityFilterContainer>
                {[
                  {
                    label: "All",
                    value: "all",
                  },
                  {
                    label: "Listing",
                    value: "listing",
                  },
                  {
                    label: "Sale",
                    value: "sale",
                  },
                ].map((filter) => {
                  if (activeFilter.includes(filter.value)) {
                    return (
                      <ActiveFilter
                        onClick={() => handleFilterClick(filter.value)}
                      >
                        <ActiveFilterLabel>{filter.label}</ActiveFilterLabel>
                      </ActiveFilter>
                    );
                  }
                  return (
                    <Filter onClick={() => handleFilterClick(filter.value)}>
                      <FilterLabel>{filter.label}</FilterLabel>
                    </Filter>
                  );
                })}
              </ActivityFilterContainer>
            </Stack>
          </SectionHeading>
          <NFTSaleActivityTable
            sales={sales}
            tokens={tokens}
            collections={collections}
            listings={listings}
            activeFilter={activeFilter}
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
      )}
    </Layout>
  );
};
