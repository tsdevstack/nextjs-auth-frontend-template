import axios, { AxiosResponse } from "axios";
import {
  ForgotPasswordApiData,
  LoginApiData,
  ResetPasswordApiData,
  SignupApiData,
} from "../validations/auth.schemas";

const nextAuthClient = axios.create({
  baseURL: "/api/auth",
  headers: {
    "Content-Type": "application/json",
  },
});
export interface MessageResponse {
  message: string;
}

export class AuthAPI {
  constructor(private client = nextAuthClient) {}

  async signup(
    reqParams: SignupApiData
  ): Promise<AxiosResponse<MessageResponse>> {
    return this.client.post("/signup", reqParams);
  }

  async login({
    email,
    password,
    botDetection,
  }: LoginApiData): Promise<AxiosResponse<MessageResponse>> {
    return this.client.post("/login", { email, password, botDetection });
  }

  async resendConfirmation(
    email: string
  ): Promise<AxiosResponse<MessageResponse>> {
    return this.client.post("/resend-confirmation", { email });
  }

  async forgotPassword({
    email,
    botDetection,
  }: ForgotPasswordApiData): Promise<AxiosResponse<MessageResponse>> {
    return this.client.post("/forgot-password", { email, botDetection });
  }

  async resetPassword({
    token,
    password,
    botDetection,
  }: ResetPasswordApiData): Promise<AxiosResponse<MessageResponse>> {
    return this.client.post("/reset-password", {
      token,
      password,
      botDetection,
    });
  }

  async confirm(token: string): Promise<AxiosResponse<MessageResponse>> {
    return this.client.post("/confirm", {
      token,
    });
  }

  async refreshToken(): Promise<AxiosResponse<MessageResponse>> {
    return this.client.post("/refresh-token");
  }

  async logout(refreshToken: string): Promise<AxiosResponse<MessageResponse>> {
    return this.client.post("/logout", { refreshToken });
  }
}

export const authAPI = new AuthAPI();
