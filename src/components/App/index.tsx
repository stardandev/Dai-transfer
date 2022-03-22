import React from "react";
import { Web3ReactProvider } from "@web3-react/core";
import Header from "../Header";
import Transfer from "../Transfer";
import { getLibrary } from "../../functions";
function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="App">
        <Header />
        <Transfer />
      </div>
    </Web3ReactProvider>
  );
}

export default App;
