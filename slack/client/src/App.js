import React from "react";
import { StoreProvider } from "./context";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { IndexContainer, MainContainer } from "./containers";

const App = () => {
    return (
        <StoreProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<IndexContainer />} />
                    <Route path="/main" element={<MainContainer />} />
                </Routes>
            </Router>
        </StoreProvider>
    );
};

export default App;
