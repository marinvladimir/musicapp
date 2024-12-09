import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import MusicPage from "./pages/MusicPage";
import AboutPage from "./pages/AboutPage";
import Header from "./components/Header";
import { ThemeProvider } from "styled-components";
import Footer from "./components/Footer";
import { theme } from "./theme";
import CheckoutPage from "./pages/CheckoutPage";
import { useCartContext } from "./states/CartContext";
import { PageWrapper } from "./AppStyles";
import Cart from "./components/Cart";
import CancelPage from "./pages/CancelPage";
import SuccessPage from "./pages/SuccessPage";

const App: React.FC = () => {
  const { cart } = useCartContext();
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <PageWrapper>
          <Header />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/cancel" element={<CancelPage />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
          <Cart cart={cart} isVisible={cart?.length > 0} />
          <Footer />
        </PageWrapper>
      </Router>
    </ThemeProvider>
  );
};

export default App;
