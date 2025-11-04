import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import PostScreen from "./screens/PostScreen";

const App = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="py-3 main-content">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/post" element={<PostScreen />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;

