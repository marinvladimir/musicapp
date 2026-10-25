import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import styled from "styled-components";
import emailjs from "@emailjs/browser";
import { ContentWrapper } from "./PageStyles";
import {
  EMAIL_SERVICE_PUBLIC_KEY,
  EMAIL_SERVICE_SERVICE_ID,
  EMAIL_SERVICE_TEMPLATE_ID,
} from "../config";

type ContactFormInputs = {
  name: string;
  email: string;
  message: string;
};

const ContactFormWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.lightGray};
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    label {
      font-weight: bold;
    }

    input,
    textarea {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid ${({ theme }) => theme.colors.accent};
      border-radius: 4px;
      background: ${({ theme }) => theme.colors.darkBlue};
      color: ${({ theme }) => theme.colors.lightGray};
    }

    button {
      background: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.lightGray};
      padding: 0.8rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: ${({ theme }) => theme.colors.accent};
      }
    }

    .error {
      color: ${({ theme }) => theme.colors.error};
      margin-bottom: 0;
      font-size: 0.9rem;
    }
  }
`;

const ContactPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInputs>();

  const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
    try {
      await emailjs.send(
        `${EMAIL_SERVICE_SERVICE_ID}`,
        `${EMAIL_SERVICE_TEMPLATE_ID}`,
        {
          from_name: data.name,
          from_email: data.email,
          message: data.message,
        },
        `${EMAIL_SERVICE_PUBLIC_KEY}`,
      );
      alert("Message sent successfully!");
      reset();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send your message. Please try again later.");
    }
  };

  return (
    <ContentWrapper>
      <ContactFormWrapper>
        <h2>Contact Me</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            {...register("name", { required: "Name is required" })}
            placeholder="Your Name"
          />
          {errors.name && <p className="error">{errors.name.message}</p>}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email address",
              },
            })}
            placeholder="Your Email"
          />
          {errors.email && <p className="error">{errors.email.message}</p>}

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            {...register("message", { required: "Message is required" })}
            rows={5}
            placeholder="Your Message"
          />
          {errors.message && <p className="error">{errors.message.message}</p>}

          <button type="submit">Send Message</button>
        </form>
      </ContactFormWrapper>
    </ContentWrapper>
  );
};

export default ContactPage;
