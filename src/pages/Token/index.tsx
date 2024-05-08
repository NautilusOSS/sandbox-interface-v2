import React, { useEffect, useMemo, useRef } from "react";
import Layout from "../../layouts/Default";
import { Container, Grid, Skeleton, Stack } from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axios from "axios";
import styled from "styled-components";
import { useCopyToClipboard } from "usehooks-ts";
import { toast } from "react-toastify";
import { useWallet } from "@txnlab/use-wallet";
import { CONTRACT, arc72 } from "ulujs";
import { getAlgorandClients } from "../../wallets";
import NFTTabs from "../../components/NFTTabs";
import { NFTInfo } from "../../components/NFTInfo";
import { getPrices } from "../../store/dexSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import { CTCINFO_LP_WVOI_VOI } from "../../contants/dex";
import { decodeRoyalties } from "../../utils/hf";
import NFTCard2 from "../../components/NFTCard2";
import { getListings } from "../../store/listingSlice";
import { getTokens } from "../../store/nftTokenSlice";
import { getSales } from "../../store/saleSlice";

const CryptoIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const ProjectIcon = styled.img`
  width: 32px;
  height: 31px;
  cursor: pointer;
`;

const ProjectLinkContainer = styled.div`
  margin-top: 27px;
  display: flex;
  align-items: flex-start;
  gap: 7px;
  color: #68727d;
  & .project-link-label-dark {
    color: #fff;
  }
  & .project-link-label-light {
    color: #000;
  }
`;

const ProjectLinkLabelContainer = styled.div`
  display: flex;
  width: 91px;
  height: 31px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
`;

const ProjectLinkLabel = styled.div`
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 12px; /* 85.714% */
  width: 339px;
`;

const AvatarWithName = styled(Stack)`
  dsplay: flex;
  align-items: center;
  color: #68727d;
  & .owner-name {
    cursor: pointer;
    color: #68727d;
    font-family: Inter;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 140%; /* 22.4px */
  }
`;

const OwnerValue = styled.div`
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: "Advent Pro";
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 12px; /* 85.714% */
`;

const OwnerLabel = styled.div`
  color: #68727d;
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 12px; /* 85.714% */
`;

const AvatarWithOwnerName = styled(AvatarWithName)`
  & .owner-value-dark {
    color: #fff;
  }
  & .owner-value-light {
    color: #000;
  }
`;

const NFTName = styled.div`
  color: #000;
  font-feature-settings: "clig" off, "liga" off;
  font-family: "Advent Pro";
  font-size: 30px;
  font-style: normal;
  font-weight: 700;
  line-height: 36px; /* 120% */
`;

const PriceDisplay = styled(Stack)`
  gap: 8px;
  & .price-label-dark {
    color: #68727d;
  }
  & .price-label-light {
    color: #000;
  }
  & .price-label {
    leading-trim: both;
    text-edge: cap;
    font-feature-settings: "clig" off, "liga" off;
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 12px; /* 85.714% */
  }
  & .price-value {
    font-family: Advent Pro;
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
    letter-spacing: 0em;
    text-align: left;
  }
`;

const BuyButton = styled.img`
  cursor: pointer;
`;

const OfferButton = styled(BuyButton)``;

const BidButton = styled(BuyButton)``;

const AuctionContainer = styled(Stack)`
  padding: 16px;
  border-radius: 16px;
  border: 1px;
  gap: 8px;
  justify-content: space-between;
  border: 1px solid #eaebf0;
  align-items: center;
  & .auction-left {
    padding: 8px;
    & .auction-label {
      font-family: Inter;
      font-size: 16px;
      font-weight: 500;
      line-height: 22px;
      letter-spacing: 0em;
      text-align: left;
      color: #68727d;
    }
    & .auction-value {
      font-family: Inter;
      font-size: 24px;
      font-weight: 700;
      line-height: 22px;
      letter-spacing: 0em;
      text-align: left;
    }
  }
  & .auction-right {
    display: flex;
    flex-direction: column;
    gap: 10px;
    & .alarm-container {
      align-items: center;
      & .time-remaining {
        font-family: Advent Pro;
        font-size: 14px;
        font-weight: 700;
        line-height: 12px;
        letter-spacing: 0em;
        text-align: left;
      }
    }
  }
`;

const MoreFrom = styled.h3`
  font-family: Advent Pro;
  font-size: 36px;
  font-weight: 700;
  line-height: 40px;
  letter-spacing: 0em;
  text-align: left;
  margin-top: 48px;
`;

const NFTCards = styled.div`
  display: flex;
  /*
  width: 1280px;
  */
  align-items: flex-start;
  gap: var(--Main-System-20px, 20px);
  align-self: stretch;
  overflow: hidden;
`;

const HeadingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
`;

const HeadingText = styled.div`
  text-align: center;
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: "Advent Pro";
  font-size: 36px;
  font-style: normal;
  font-weight: 700;
  line-height: 40px; /* 111.111% */
  color: #161717;
  &.light {
    color: #161717;
  }
  &.dark {
    color: #fff;
  }
`;

const SecondaryButton = styled.div`
  display: flex;
  padding: 20px;
  justify-content: center;
  align-items: center;
  gap: 3px;
  border-radius: 100px;
  border: 1px solid #93f;
`;

const ButtonLabel = styled.div`
  color: #93f;
  text-align: center;
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Nohemi;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px; /* 125% */
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const TokenSkeleton: React.FC = () => (
  <Container sx={{ mt: 5 }} maxWidth="lg">
    <Grid
      sx={{
        border: "1px",
        alignItems: "center",
      }}
      container
      spacing="60px"
    >
      <Grid item xs={12} md={6}>
        <Skeleton
          variant="rounded"
          height={459}
          width={459}
          sx={{
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: "16px",
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Stack gap={2}>
          <Skeleton variant="text" height={24} width={100} />
          <Skeleton variant="text" height={24} width={75} />
          <Skeleton variant="text" height={24} width={150} />
          <Skeleton variant="text" height={24} width={25} />
          <Skeleton variant="text" height={24} width={150} />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="text" height={48} width={200} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map(() => (
            <Grid item xs={6} sm={4} md={3}>
              <Skeleton
                variant="rounded"
                height={400}
                width="100%"
                sx={{
                  borderRadius: "16px",
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  </Container>
);

export const Token: React.FC = () => {
  const { activeAccount } = useWallet();
  const dispatch = useDispatch();
  /* Sales */
  const sales = useSelector((state: any) => state.sales.sales);
  const salesStatus = useSelector((state: any) => state.sales.status);
  useEffect(() => {
    dispatch(getSales() as unknown as UnknownAction);
  }, [dispatch]);
  /* Tokens */
  const tokens = useSelector((state: any) => state.tokens.tokens);
  const tokenStatus = useSelector((state: any) => state.tokens.status);
  useEffect(() => {
    dispatch(getTokens() as unknown as UnknownAction);
  }, [dispatch]);
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
  /* Router */
  const { id, tid } = useParams();
  const navigate = useNavigate();
  /* Copy to clipboard */
  const [copiedText, copy] = useCopyToClipboard();
  const handleCopy = (text: string) => () => {
    copy(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((error) => {
        toast.error("Failed to copy to clipboard!");
      });
  };
  /* Theme */
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  /* Carousel */
  const listingsRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState<number>(0);
  const handleClick = () => {
    const width = listingsRef?.current?.children?.length || 0;
    if (-(offset - 500) > width * 250) {
      setOffset(0);
    } else {
      setOffset(offset - 500);
    }
  };

  // const [collection, setCollection] = React.useState<any>(null);
  // React.useEffect(() => {
  //   try {
  //     (async () => {
  //       const {
  //         data: { tokens: res },
  //       } = await axios.get(
  //         `https://arc72-idx.voirewards.com/nft-indexer/v1/tokens?contractId=${id}`
  //       );
  //       const nfts = [];
  //       for (const t of res) {
  //         const tm = JSON.parse(t.metadata);
  //         nfts.push({
  //           ...t,
  //           metadata: tm,
  //         });
  //       }
  //       setCollection(nfts);
  //     })();
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }, [id]);
  const collection = useMemo(() => {
    const collectionTokens =
      tokens?.filter((t: any) => `${t.contractId}` === `${id}`) || [];
    return collectionTokens;
  }, [tokens, id]);

  // const [listings, setListings] = React.useState<any>(null);
  // useEffect(() => {
  //   try {
  //     (async () => {
  //       const {
  //         data: { listings: res },
  //       } = await axios.get(
  //         `https://arc72-idx.nftnavigator.xyz/nft-indexer/v1/mp/listings`,
  //         {
  //           params: {
  //             collectionId: id,
  //             //tokenId: tid,
  //             active: true,
  //           },
  //         }
  //       );
  //       setListings(res);
  //     })();
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }, [id]);
  const collectionListings = useMemo(() => {
    return listings?.filter((l: any) => `${l.collectionId}` === `${id}`) || [];
  }, [listings, id]);

  const [collectionInfo, setCollectionInfo] = React.useState<any>(null);
  useEffect(() => {
    try {
      axios
        .get(`https://test-voi.api.highforge.io/projects/info/${id}`)
        .then((res: any) => res.data)
        .then(setCollectionInfo);
    } catch (e) {
      console.log(e);
    }
  }, [id]);

  const [nft, setNft] = React.useState<any>(null);
  useEffect(() => {
    if (!collection || !tid || !collectionListings || !listings) return;
    (async () => {
      const { algodClient, indexerClient } = getAlgorandClients();
      const ciARC72 = new arc72(Number(id), algodClient, indexerClient, {
        acc: {
          addr: "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ",
          sk: new Uint8Array(0),
        },
      });
      const arc72_ownerOfR = await ciARC72.arc72_ownerOf(Number(tid));
      const arc72_getApprovedR = await ciARC72.arc72_getApproved(Number(tid));
      if (!arc72_ownerOfR.success) throw new Error("Failed to get owner");
      if (!arc72_getApprovedR.success)
        throw new Error("Failed to get approved");
      const arc72_ownerOf = arc72_ownerOfR.returnValue;
      const arc72_getApproved = arc72_getApprovedR.returnValue;

      const nft = collection.find((el: any) => el.tokenId === Number(tid));

      const listing = [...collectionListings]
        .filter(
          (l: any) =>
            `${l.collectionId}` === `${id}` &&
            `${l.tokenId}` === `${tid}` &&
            `${l.seller}` === `${arc72_ownerOf}`
        )
        .sort((a: any, b: any) => b.timestamp - a.timestamp)
        .pop();

      // check listing
      let validListing = true;
      if (listing) {
        const ci = new CONTRACT(
          listing.mpContractId,
          algodClient,
          indexerClient,
          {
            name: "",
            desc: "",
            methods: [
              {
                name: "v_sale_listingByIndex",
                args: [
                  {
                    type: "uint256",
                  },
                ],
                readonly: true,
                returns: {
                  type: "(uint64,uint256,address,(byte,byte[40]),uint64,uint64,uint64,uint64,uint64,uint64,address,address,address)",
                },
              },
            ],
            events: [],
          },
          {
            addr:
              activeAccount?.address ||
              "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ",
            sk: new Uint8Array(0),
          }
        );
        const v_sale_listingByIndexR = await ci.v_sale_listingByIndex(
          listing.mpListingId
        );
        if (!v_sale_listingByIndexR.success) {
          validListing = false;
        }
      }
      const royalties = nft?.metadata?.royalties
        ? decodeRoyalties(nft?.metadata?.royalties || "")
        : {};
      const displayNft = {
        ...nft,
        royalties,
        approved: arc72_getApproved,
        owner: arc72_ownerOf,
        listing: validListing ? listing : undefined,
      };
      setNft(displayNft);
    })().catch((e) => {
      console.log(e);
      toast.error(e.message);
    });
  }, [id, tid, collection, collectionListings, activeAccount]);

  const listedNfts = useMemo(() => {
    const listedNfts =
      collection
        ?.filter((nft: any) => {
          return listings?.some(
            (listing: any) =>
              `${listing.collectionId}` === `${nft.contractId}` &&
              `${listing.tokenId}` === `${nft.tokenId}`
          );
        })
        ?.map((nft: any) => {
          const listing = listings.find(
            (l: any) =>
              `${l.collectionId}` === `${nft.contractId}` &&
              `${l.tokenId}` === `${nft.tokenId}`
          );
          return {
            ...nft,
            listing,
          };
        }) || [];
    listedNfts.sort(
      (a: any, b: any) => b.listing.timestamp - a.listing.timestamp
    );
    return listedNfts;
  }, [collection, listings]);

  const moreNfts = useMemo(() => {
    if (!nft) return [];
    return listedNfts?.filter((el: any) => el.tokenId !== nft.tokenId);
  }, [nft, listedNfts]);

  const isLoading = React.useMemo(
    () =>
      salesStatus !== "succeeded" ||
      tokenStatus !== "succeeded" ||
      listingsStatus !== "succeeded" ||
      dexStatus !== "succeeded" ||
      !sales ||
      !prices ||
      !nft ||
      !listings ||
      !collectionInfo ||
      !tokens ||
      !collection,
    [nft, listings, collectionInfo, tokens, collection]
  );

  return (
    <Layout>
      {!isLoading ? (
        <Container sx={{ pt: 5 }} maxWidth="xl">
          <Stack style={{ gap: "64px" }}>
            <NFTInfo
              nft={nft}
              collection={collection}
              collectionInfo={collectionInfo}
              loading={isLoading}
              exchangeRate={exchangeRate}
            />
            <NFTTabs
              exchangeRate={exchangeRate}
              nft={nft}
              loading={isLoading}
            />

            <HeadingContainer>
              <HeadingText
                className={isDarkTheme ? "dark" : "light"}
              >{`More from ${
                collectionInfo?.project?.title ||
                nft?.metadata?.name.replace(/[#0123456789 ]*$/, "")
              }`}</HeadingText>
              <StyledLink to={`/collection/${nft.contractId}`}>
                <SecondaryButton>
                  <ButtonLabel>View Collection</ButtonLabel>
                </SecondaryButton>
              </StyledLink>
            </HeadingContainer>
            <NFTCards ref={listingsRef}>
              <div
                style={{
                  position: "absolute",
                  right: 20,
                  transform: "translate(-50%, -50%)",
                  zIndex: 1,
                  cursor: "pointer",
                }}
                onClick={handleClick}
              >
                <div
                  style={{
                    position: "relative",
                    top: 215,
                    right: -15,
                  }}
                >
                  <svg
                    width="98"
                    height="98"
                    viewBox="0 0 98 98"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g filter="url(#filter0_d_494_13335)">
                      <rect
                        x="25"
                        y="25"
                        width="48"
                        height="48"
                        rx="24"
                        fill="#99FF33"
                        shape-rendering="crispEdges"
                      />
                      <path
                        d="M39.6667 49H58.3334M58.3334 49L49 39.6667M58.3334 49L49 58.3334"
                        stroke="#161717"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <filter
                        id="filter0_d_494_13335"
                        x="0"
                        y="0"
                        width="98"
                        height="98"
                        filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                      >
                        <feFlood
                          flood-opacity="0"
                          result="BackgroundImageFix"
                        />
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        />
                        <feOffset />
                        <feGaussianBlur stdDeviation="12.5" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                        />
                        <feBlend
                          mode="normal"
                          in2="BackgroundImageFix"
                          result="effect1_dropShadow_494_13335"
                        />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="effect1_dropShadow_494_13335"
                          result="shape"
                        />
                      </filter>
                    </defs>
                  </svg>
                </div>
              </div>
              {moreNfts.map((el: any) => (
                <NFTCard2
                  style={{
                    position: "relative",
                    left: offset,
                    transition: "left 1s",
                  }}
                  nftName={el?.metadata?.name}
                  image={
                    "https://prod.cdn.highforge.io/i/" +
                    encodeURIComponent(el.metadataURI) +
                    "?w=400"
                  }
                  price={(el.listing.price / 1e6).toLocaleString()}
                  currency={"VIA"}
                  onClick={() => {
                    navigate(
                      `/collection/${el.contractId}/token/${el.tokenId}`
                    );
                    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                  }}
                />
              ))}
            </NFTCards>
          </Stack>
        </Container>
      ) : (
        <TokenSkeleton />
      )}
    </Layout>
  );
};
