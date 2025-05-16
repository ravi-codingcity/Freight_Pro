import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Add_rates from "./pages/Add_rates";
import Login from "./pages/Login";
import View_rates from "./pages/View_rates";
import Expired_rates from "./pages/Expired_rates";
import Import_Export from "./pages/Import_Export";
import Under_production from "./pages/Under_production";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/export/view_rates" element={<View_rates />} />
        <Route path="/import_export" element={<Import_Export />} />
        <Route path="/export/add_rates" element={<Add_rates />} />
        <Route path="/export/expired_rates" element={<Expired_rates />} />
        <Route path="/import/under_production" element={<Under_production />} />
      </Routes>
    </Router>
  );
};

export default App;
