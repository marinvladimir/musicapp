import React, { useEffect, useState } from "react";
import { ContentWrapper, MusicContainer } from "./PageStyles";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { API_BASE_URL } from "../config";
import { theme } from "../theme";
import { useCartContext } from "../states/CartContext";

const CancelNavWrapper = styled.nav`
  display: flex;
  justify-content: center;

  a {
    color: ${(props) => props.theme.colors.textSecondary};
    text-decoration: none;
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0 1.5rem;
    transition:
      color 0.3s ease-in-out,
      transform 0.3s ease-in-out;

    &:hover {
      color: ${(props) => props.theme.colors.accent};
      transform: scale(1.1);
    }
  }
`;

const SuccessWrapper = styled.div`
  background-color: ${theme.colors.darkBlueVariant};
  color: ${theme.colors.textPrimary};
  padding: ${theme.spacing.large};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const SuccessMessage = styled.p`
  font-size: ${theme.typography.headingFontSize};
  font-weight: ${theme.typography.fontWeightBold};
  margin-bottom: ${theme.spacing.medium};
`;

const DownloadWrapper = styled.div`
  margin-bottom: ${theme.spacing.medium};
  background-color: ${theme.colors.secondary};
  padding: ${theme.spacing.medium};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 100%;
  word-wrap: break-word;
  white-space: normal;

  @media (max-width: 768px) {
    padding: ${theme.spacing.small};
    margin-bottom: ${theme.spacing.small};
    width: 100%;
    box-shadow: none;
  }
`;

const DownloadLink = styled.a`
  display: inline-block;
  background-color: ${theme.colors.accent};
  color: ${theme.colors.textPrimary};
  padding: ${theme.spacing.small} ${theme.spacing.medium};
  border-radius: 4px;
  text-decoration: none;
  font-weight: ${theme.typography.fontWeightBold};
  margin: ${theme.spacing.small} 0;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    background-color: ${theme.colors.purple};
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: ${theme.spacing.small} ${theme.spacing.small};
  }
`;

const ErrorMessage = styled.p`
  color: ${theme.colors.pink};
  font-size: ${theme.typography.bodyFontSize};
`;

interface PaymentStatusResponse {
  status: string;
  error?: string;
}

interface DownloadLinkResponse {
  fileLinks: {
    productName: string;
    downloadLink?: string;
    error?: string;
  }[];
}

const SuccessPage: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<
    { productName: string; downloadLink?: string; error?: string }[] | null
  >(null);
  const { setCart } = useCartContext();

  const sessionId = localStorage.getItem("stripeSessionId");

  const removeFromCart = async (songName: string) => {
    try {
      await fetch(`${API_BASE_URL}/.netlify/functions/deleteCart`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          songName: songName,
        }),
      });

      setCart((prevCart) => prevCart.filter((item) => item.songName !== songName));
    } catch (error) {
      console.error("Error removing song from cart:", error);
    }
  };

  const clearCart = () => {
    downloadLinks?.forEach((file) => {
      removeFromCart(file.productName);
    });
  };

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!sessionId) return;
  
      try {
        const response = await fetch(`${API_BASE_URL}/.netlify/functions/checkPayment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
  
        const data: PaymentStatusResponse = await response.json();
  
        if (response.ok && data.status === "success") {
          setPaymentStatus("success");
          const songUrls = await fetchDownloadLinks();
          setDownloadLinks(songUrls);
          if (songUrls && songUrls.length > 0) {
            clearCart();
          }
        } else {
          setPaymentStatus("error");
        }
      } catch (error) {
        console.error("Error verifying payment status:", error);
      }
    };
  
    fetchPaymentStatus();
  }, [sessionId]);

  const fetchDownloadLinks = async (): Promise<
    { productName: string; downloadLink?: string; error?: string }[] | null
  > => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/.netlify/functions/getDownloadLink`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        },
      );

      const data: DownloadLinkResponse = await response.json();
      return data.fileLinks;
    } catch (error) {
      console.error("Error fetching download links:", error);
      return null;
    }
  };

  return (
    <ContentWrapper>
      <MusicContainer>
        {paymentStatus === "success" ? (
          <SuccessWrapper>
            <SuccessMessage>
              Purchase was successful. Go back to the home page?
            </SuccessMessage>
            {downloadLinks ? (
              downloadLinks.map((file) => (
                <DownloadWrapper key={file.productName}>
                  {file.downloadLink ? (
                    <DownloadLink href={file.downloadLink} download>
                      Download {file.productName}
                    </DownloadLink>
                  ) : (
                    <ErrorMessage>
                      {file.error || "Error: File not found"}
                    </ErrorMessage>
                  )}
                </DownloadWrapper>
              ))
            ) : (
              <h2>Loading download links...</h2>
            )}
          </SuccessWrapper>
        ) : (
          <h2>{paymentStatus || "Processing payment..."}</h2>
        )}
        <CancelNavWrapper>
          <NavLink to="/">Back to home</NavLink>
        </CancelNavWrapper>
      </MusicContainer>
    </ContentWrapper>
  );
};

export default SuccessPage;
