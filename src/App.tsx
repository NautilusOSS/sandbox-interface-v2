import React from "react";
import { WalletProvider, useInitializeProviders } from "@txnlab/use-wallet";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import store, { RootState } from "./store/store";
import Navbar from "./components/Navbar";
import { routes } from "./routes";
import { getProviderInit } from "./wallets";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";

const BackgroundLayer = styled.div`
  width: 100%;
  height: 100%;
  top: 0;
`;

interface AppContainerProps {
  children: React.ReactNode;
}
const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  return (
    <div
      style={{
        color: isDarkTheme ? "#fff" : "#000",
        transition: "all 0.25s linear",
      }}
    >
      <BackgroundLayer
        className="background-layer"
        style={{
          background: isDarkTheme ? "#161717" : "#FFFFFF",
        }}
      ></BackgroundLayer>
      <div className="content-layer" style={{ width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const providers = useInitializeProviders(getProviderInit());
  return (
    <WalletProvider value={providers}>
      <Provider store={store}>
        <AppContainer>
          <Router>
            <Navbar />
            <Routes>
              {routes.map((el) => (
                <Route path={el.path} Component={el.Component} />
              ))}
            </Routes>
          </Router>
        </AppContainer>
      </Provider>
      <ToastContainer />
    </WalletProvider>
  );
};

export default App;
