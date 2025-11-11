import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./scrollToTop";
import Header from "./components/header";
import Footer from "./components/footer";
import Main from "./components/main/main";
import Detail from "./components/detail/detail";
import Hrv from "./components/main/hrv";
import HrvCalculationGuide from "./components/main/hrv/HrvCalculationGuide";
import Test from "./Test.js";
function App() {
  return (
    <>
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Test />} />
        {/* <Route path="/" element={<Main />} /> */}
        <Route path="/hrv" element={<Hrv />} />
        <Route path="/detail/:code" element={<Detail />} />
        <Route path="/hrv-guide" element={<HrvCalculationGuide />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
