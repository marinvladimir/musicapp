import React, { useEffect, useRef } from "react";
import styled, { css, keyframes } from "styled-components";
import { useT } from "../i18n";

const open = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: none; }
`;

export type PanelVariant = "paper" | "window" | "drawer";

const Backdrop = styled.div<{ $variant: PanelVariant }>`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(10, 10, 20, 0.55);
  backdrop-filter: blur(3px);

  ${({ $variant }) =>
    $variant === "drawer" &&
    css`
      justify-content: flex-start;
      align-items: stretch;
      background: transparent;
      backdrop-filter: none;
      pointer-events: none;
      padding-top: 80px;

      @media (max-width: 640px) {
        align-items: flex-end;
      }
    `}
`;

const Dialog = styled.section<{ $variant: PanelVariant }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 100%;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  pointer-events: auto;
  outline: none;
  animation: ${open} 0.28s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  ${({ $variant, theme }) =>
    $variant === "paper"
      ? css`
          max-width: 920px;
          background: ${theme.colors.paper};
          color: ${theme.colors.ink};
        `
      : $variant === "window"
        ? css`
            max-width: 1040px;
            background: ${theme.colors.surface};
            border: 1px solid ${theme.colors.border};
          `
        : css`
            max-width: 400px;
            background: rgba(27, 27, 46, 0.94);
            border: 1px solid ${theme.colors.border};

            @media (max-width: 640px) {
              max-width: none;
              max-height: 62%;
            }
          `}
`;

const TitleBar = styled.header<{ $variant: PanelVariant }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.85rem;
  border-bottom: 1px solid
    ${({ $variant, theme }) =>
      $variant === "paper" ? "#e6e4f5" : theme.colors.border};
  color: ${({ $variant, theme }) =>
    $variant === "paper" ? theme.colors.inkMuted : theme.colors.textMuted};

  h2 {
    flex: 1;
    min-width: 0;
    font: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Dots = styled.span`
  display: flex;
  gap: 6px;

  span {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }
`;

const CloseButton = styled.button<{ $variant: PanelVariant }>`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: ${({ $variant }) =>
      $variant === "paper" ? "#efeeff" : "rgba(255, 255, 255, 0.08)"};
  }
`;

const Body = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

const Panel: React.FC<{
  title: string;
  variant: PanelVariant;
  onClose: () => void;
  actions?: React.ReactNode;
  print?: boolean;
  children: React.ReactNode;
}> = ({ title, variant, onClose, actions, print, children }) => {
  const dialog = useRef<HTMLElement>(null);
  const t = useT();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <Backdrop
      $variant={variant}
      onClick={variant === "drawer" ? undefined : onClose}
    >
      <Dialog
        ref={dialog}
        $variant={variant}
        role="dialog"
        aria-modal={variant !== "drawer"}
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        data-print={print ? "" : undefined}
      >
        <TitleBar $variant={variant} data-no-print>
          {variant === "window" && (
            <Dots aria-hidden>
              <span style={{ background: "#ff6b6b" }} />
              <span style={{ background: "#ffc46b" }} />
              <span style={{ background: "#4fd1c5" }} />
            </Dots>
          )}
          <h2>{title}</h2>
          {actions}
          <CloseButton
            $variant={variant}
            onClick={onClose}
            aria-label={t.close}
          >
            ×
          </CloseButton>
        </TitleBar>
        <Body>{children}</Body>
      </Dialog>
    </Backdrop>
  );
};

export default Panel;
