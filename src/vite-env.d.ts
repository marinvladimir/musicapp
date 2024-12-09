declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "*.css";
declare module "../config" {
  export const API_BASE_URL: string;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_STRIPE_SECRET_KEY: string;
  VITE_API_BASE_URL: string;
  VITE_FILE_BASE_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
