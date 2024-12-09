import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Album, CartContextType, CartProviderProps } from "../types/global";
import { API_BASE_URL } from "../config";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<{ songName: string; price: number }[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getSessionId = () => {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  };

  const sessionId = getSessionId();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [albumsResponse, cartResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/.netlify/functions/albums`),
          fetch(`${API_BASE_URL}/.netlify/functions/getCart?sessionId=${sessionId}`),
        ]);
        const albumsData: Album[] = await albumsResponse.json();
        const cartData: { song_name: string; price: number }[] =
          await cartResponse.json();
        setAlbums(albumsData);
        setCart(
          cartData.map((item) => ({
            songName: item.song_name,
            price: item.price,
          })),
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  return (
    <CartContext.Provider
      value={{ sessionId, cart, setCart, albums, setAlbums, isLoading }}
    >
      {children}
    </CartContext.Provider>
  );
};
