import { AxiosResponse } from "axios";
import { UserDto } from "@shared/auth-service-client";
import { UserProfileDto } from "@shared/bff-service-client";
import { authenticatedClient } from "./axios-authenticated";

const baseUrl = "/api/user";
export class UserAPI {
  constructor(private client = authenticatedClient) {}

  async account(): Promise<AxiosResponse<UserDto>> {
    return this.client.get(`${baseUrl}/account`);
  }

  async profile(): Promise<AxiosResponse<UserProfileDto>> {
    return this.client.get(`${baseUrl}/profile`);
  }
}

export const userAPI = new UserAPI();
