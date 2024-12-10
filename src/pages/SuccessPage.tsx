import React, { useEffect, useState } from "react";
import { ContentWrapper, MusicContainer } from "./PageStyles";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { API_BASE_URL } from "../config";
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

  @media (max-width: 512px) {
    display: none;
  }
`;

interface PaymentStatusResponse {
  status: string;
  error?: string;
}

interface DownloadLinkResponse {
  downloadLink: string;
}

const SuccessPage: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);

  const { sessionId } = useCartContext();

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      // try {
        // const response = await fetch(
        //   `${API_BASE_URL}/.netlify/functions/checkPayment`,
        //   {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ sessionId }),
        //   },
        // );

        // const data: PaymentStatusResponse = await response.json();

        // if (response.ok) {
          // setPaymentStatus(data.status);

          // if (data.status === "success") {
            const songUrl = await fetchDownloadLink();
            setDownloadLink(songUrl);
          // }
        // } else {
        //   setPaymentStatus(`Error: ${data.error || "Unknown error"}`);
        // }
      // } catch (error) {
      //   console.error("Error checking payment status:", error);
      //   setPaymentStatus("Error checking payment status");
      // }
    };

    if (sessionId) {
      fetchPaymentStatus();
    }
  }, [sessionId]);

  const fetchDownloadLink = async (): Promise<string | null> => {
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
      return data.downloadLink;
    } catch (error) {
      console.error("Error fetching download link:", error);
      return null;
    }
  };

  return (
    <ContentWrapper>
      <MusicContainer>
        {/* {paymentStatus === "success" ? ( */}
          <div style={{ marginBottom: "16px" }}>
            <p>Purchase was successful. Go back to home page?</p>
            {downloadLink ? (
              <a href={downloadLink} download>
                Download Your Song
              </a>
            ) : (
              <h2>Loading download link...</h2>
            )}
          </div>
        {/* ) : (
          <h2>{paymentStatus || "Processing payment..."}</h2>
        )} */}
        <CancelNavWrapper>
          <NavLink to="/">Back to home</NavLink>
        </CancelNavWrapper>
      </MusicContainer>
    </ContentWrapper>
  );
};

export default SuccessPage;
