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

  const { sessionId } = useCartContext();

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/.netlify/functions/checkPayment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          },
        );

        const data: PaymentStatusResponse = await response.json();

        if (response.ok) {
          setPaymentStatus(data.status);

          if (data.status === "success") {
            const songUrls = await fetchDownloadLinks();
            setDownloadLinks(songUrls);
          }
        } else {
          setPaymentStatus(`Error: ${data.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setPaymentStatus("Error checking payment status");
      }
    };

    if (sessionId) {
      fetchPaymentStatus();
    }
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
          <div style={{ marginBottom: "16px" }}>
            <p>Purchase was successful. Go back to home page?</p>
            {downloadLinks ? (
              downloadLinks.map((file) => (
                <div key={file.productName}>
                  {file.downloadLink ? (
                    <a href={file.downloadLink} download>
                      Download {file.productName}
                    </a>
                  ) : (
                    <p>{file.error || "Error: File not found"}</p>
                  )}
                </div>
              ))
            ) : (
              <h2>Loading download links...</h2>
            )}
          </div>
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
