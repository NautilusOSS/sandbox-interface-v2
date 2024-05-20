import React from "react";
import styled from "styled-components";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Marquee from "react-fast-marquee";
import { Stack } from "@mui/material";
import { Link } from "react-router-dom";

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const LayoutRoot = styled.div`
  padding: 0px 40px;
  padding-bottom: 40px;
  @media (max-width: 600px) {
    padding: 0px 10px;
    padding-bottom: 80px;
  }1
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  return (
    <>
      <LayoutRoot
        style={{ background: isDarkTheme ? "rgb(22, 23, 23)" : undefined }}
      >
        <header>
          <Marquee gradient={false}>
            <Stack
              direction="row"
              spacing={30}
              style={{
                color: isDarkTheme ? "#fff" : "#000",
                fontSize: "1.2rem",
                padding: "1rem",
              }}
            >
              {/*[
                {
                  label: "Humble Defi Suite",
                  link: "https://voi.humble.sh",
                },
                {
                  label: "Nautilus NFT Marketplace",
                  link: "https://nautilus.sh",
                },
                {
                  label: "MechaSwap Trustless NFT Exchange",
                  link: "https://mechaswap.nautilus.sh",
                },
              ].map((el) => (
                <StyledLink target="_blank" to={el.link}>
                  <div>{el.label}</div>
                </StyledLink>
              ))*/}
            </Stack>
          </Marquee>
        </header>
        <main>{children}</main>
      </LayoutRoot>
      {/*<Footer />*/}
    </>
  );
};

export default Layout;
