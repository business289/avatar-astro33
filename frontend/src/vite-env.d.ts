/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
}

declare module "*.png" { const src: string; export default src; }
declare module "*.jpg" { const src: string; export default src; }
declare module "*.jpeg" { const src: string; export default src; }
declare module "*.svg" { const src: string; export default src; }
declare module "*.webp" { const src: string; export default src; }