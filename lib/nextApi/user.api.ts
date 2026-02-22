import { AxiosResponse } from "axios";
import { UserDto } from "@shared/auth-service-client";
import { authenticatedClient } from "./axios-authenticated";

const baseUrl = "/api/user";
export class UserAPI {
  constructor(private client = authenticatedClient) {}

  async account(): Promise<AxiosResponse<UserDto>> {
    return this.client.get(`${baseUrl}/account`);
  }
}

export const userAPI = new UserAPI();
