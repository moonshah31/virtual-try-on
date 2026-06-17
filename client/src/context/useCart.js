import { useContext } from "react";
import { CartContext } from "./CartContextCore.js";

export const useCart = () => useContext(CartContext);
