import { useContext } from "react";
import { CartContext } from "./CartContextCore";

export const useCart = () => useContext(CartContext);
