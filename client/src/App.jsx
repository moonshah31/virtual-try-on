import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import TryOn from "./pages/TryOn.jsx";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/tryon" element={<TryOn />} />
      
      </Routes>
    </BrowserRouter>
  );
}

export default App;
