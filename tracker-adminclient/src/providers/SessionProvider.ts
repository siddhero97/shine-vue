import { RawAuthenticationRequest, RawSessionResponse } from '@/interfaces/SessionInterfaces';
import axios from 'axios';
import StatusCodes from 'http-status-codes'
import { ProviderBase } from './ProviderBase';
const { UNAUTHORIZED, OK  } = StatusCodes;

export default class SessionProvider extends ProviderBase {
  protected API_ENTITY_URL = `${ProviderBase.API_BASE_URL}/session`;

  /**
   * Authenticate the User
   */
  async createAsync(rawSessionRequest: RawAuthenticationRequest): Promise<RawSessionResponse | null> {
    try {
      const response = await axios.post(`${this.API_ENTITY_URL}`,
        rawSessionRequest,
        {
          headers: {
            'Content-Type': "application/json"
          }
        });
      console.log(`Response from the axios post: ${JSON.stringify(response, null, 2)}`);

      if (response.status === OK) {
        console.log(`Response status was: ${response.status} - ${response.statusText}`);
        return response.data as RawSessionResponse; // true if status is a success one, false otherwise
      }
      else {
        console.log(`Session Response was not OK: ${response.status} - ${response.statusText}`);
        return null;
      }
    } catch (error) {
      console.log(`Error from the axios post: ${error}`);
      return null;
    }
  }

  /**
   * @TODO currently not used; can't be called in adminStore bc. circular dependencies
   * Check if the user is authenticated
   *  
   * @returns Promise<boolean> if the user has access to admin-client
   */
  public async authenticateAsync(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.API_ENTITY_URL}/checkAuthenticated`, this.getAxiosAuthConfig());

      console.log(`Response from the axios get: ${JSON.stringify(response, null, 2)}`);
      const status: number = response.status;
      console.log(`Response status was: ${status} - ${response.statusText}`);

      // If accessToken doesn't work, try refreshing it
      if (status === UNAUTHORIZED) {
        const successfulSecondTime =
          await this.tryRefreshingAccessToken(() => this.authenticateAsync());
        return successfulSecondTime;
      }

      return (status === OK); // true if status is OK, false otherwise
    } catch (error) {
      console.log(`Error from the axios put: ${error}`);
      return false;
    }
  }

  /**
   * Log out the User
   * @returns Promise<boolean> if the user was successfuly logged out
   */
  async logoutAsync(): Promise<boolean> {
    try {
      const response = await axios.post(`${this.API_ENTITY_URL}/logout`,
        {
          refreshToken: this.refreshTokenRef.value,
          userId: this.sessionRef.value.userId,
        },
        {
          headers: {
            'Content-Type': "application/json"
          }
        });
      console.log(`Response from the axios post: ${JSON.stringify(response, null, 2)}`);

      return (response.status === OK);
    } catch (error) {
      console.log(`Error from the axios post: ${error}`);
      return false;
    }
  }

  
}