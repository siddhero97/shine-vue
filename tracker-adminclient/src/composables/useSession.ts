import { RawAuthenticationRequest, RawSessionResponse } from "@/interfaces/SessionInterfaces";
import SessionProvider from "@/providers/SessionProvider";
import { useStore } from "@/store/adminStore";

export const useSession = () => {
  // This is what we "export"
  const store = useStore();
  const { accessToken, refreshToken, session } = store.state;
  const sessionProvider = new SessionProvider();

  /**
   * Submits the login form information & stores the userId + token
   * 
   * @returns Promise<bool>
   */
  const authenticateAsync = async (mobilePhone: string, password: string): Promise<boolean> => {

    const rawSessionRequest: RawAuthenticationRequest = {
      mobilePhone: mobilePhone,
      password: password,
    }
  
    const rawSessionResponse: RawSessionResponse | null = await sessionProvider.createAsync(rawSessionRequest);

    console.log(`authenticateAsync: returned token/userId is ${JSON.stringify(rawSessionResponse, null, 2)}`);
    if (rawSessionResponse !== null) {
      accessToken.value = rawSessionResponse.accessToken;
      refreshToken.value = rawSessionResponse.refreshToken;
      session.value = rawSessionResponse.session;
      
      return true;
    }
    
    return false;
  }

  /**
   * Log the User out
   * 
   * @returns Promise<bool>
   */
  const logoutAsync = async (): Promise<boolean> => {

    const logoutSuccessful = await sessionProvider.logoutAsync();

    if (logoutSuccessful) {
      store.methods.clearSession();
    }

    return logoutSuccessful;
  }
  
  /**
   * @TODO currently not used; can't be called in adminStore bc. circular dependencies
   * @returns Promise<boolean> whether the user is currently logged in
   */
  const isAuthenticatedAsync = async (): Promise<boolean> => {
    return sessionProvider.authenticateAsync();
  }

  return {
    session, // @TODO Is this bad practice? Is there an alternative?
    submitSessionAsync: authenticateAsync,
    isAuthenticatedAsync,
    logoutAsync,
  };
};
