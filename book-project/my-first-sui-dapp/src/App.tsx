import { useCurrentAccount } from "@mysten/dapp-kit";
import { isValidSuiObjectId } from "@mysten/sui.js/utils";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";
import { Counter } from "./Counter";
import { CreateCounter } from "./mint";
import { BasicNavbar } from "./Navbar";
import { IniMarketlist } from "./Market"
import { Route, Routes } from "react-router-dom";
import { IniMyassetlist } from "./Myasset";
import { IniTransfer } from "./transfer";


function App() {
  const currentAccount = useCurrentAccount();
  const [counterId, setCounter] = useState(() => {
    const hash = window.location.hash.slice(1);
    return isValidSuiObjectId(hash) ? hash : null;
  });
  localStorage.setItem('packageId', '0xe5ff61371d7c5461f165477bb985741e01bc7bb01d867e439f0df6c4f6eaf0b5');

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <BasicNavbar />
        </Box>
      </Flex>
      <Routes>
        <Route path="/Mint" element={
          <Container>
            <Container
              mt="5"
              pt="2"
              px="4"
              style={{ background: "var(--gray-a2)", minHeight: 500 }}>
              {currentAccount ? (
                counterId ? (
                  <Counter id={counterId} />
                ) : (
                  <CreateCounter
                    onCreated={(id) => {
                      window.location.hash = id;
                      setCounter(id);
                    }}
                  />
                )
              ) : (
                <Heading>Please connect your wallet</Heading>
              )}
            </Container>
          </Container>
        }>
        </Route>
        <Route path="/Market" element={
          <IniMarketlist />
        }>
        </Route>
        <Route path="/Transfer" element={
          <IniTransfer />
        }>
        </Route>
        <Route path="/MyAsset" element={
          <IniMyassetlist />
        }>
        </Route>

      </Routes>
    </>
  );
}

export default App;
