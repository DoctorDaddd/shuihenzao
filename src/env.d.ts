/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_CLOUDBASE_ENV_ID?: string;
  readonly VITE_CLOUDBASE_REGION?: string;
  readonly VITE_CLOUDBASE_FUNCTION?: string;
  readonly VITE_BACKEND?: "local" | "cloudbase";
}
