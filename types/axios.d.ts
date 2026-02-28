import { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    metadata?: {
      refreshToken?: string;
    };
  }
  export interface InternalAxiosRequestConfig {
    metadata?: {
      refreshToken?: string;
    };
  }
}
