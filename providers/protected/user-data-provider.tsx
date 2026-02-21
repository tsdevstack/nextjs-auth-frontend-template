"use client";

import { userAPI } from "@/lib/nextApi/user.api";
import { UserDto } from "@shared/auth-service-client";
import { createContext, useContext, useEffect, useState } from "react";

const initialData: UserDto = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  confirmed: false,
  status: "INACTIVE",
  createdAt: new Date().toISOString(),
  role: "USER",
};

interface UserDataContextProps {
  state: UserDto | null;
}

const UserDataContext = createContext<UserDataContextProps>({
  state: null,
});

interface UserDataProviderClient {
  children: React.ReactNode;
}

export function UserDataProvider({ children }: UserDataProviderClient) {
  const [state, setState] = useState(initialData);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await userAPI.account();
        setState(res.data);
      } catch {
        // Auth failure is handled by axios interceptor (redirect to login)
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-muted border-t-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserDataContext.Provider value={{ state }}>
      {children}
    </UserDataContext.Provider>
  );
}

export const useUserDataProvider = () => useContext(UserDataContext);
