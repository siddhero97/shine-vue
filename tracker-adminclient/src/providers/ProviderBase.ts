import axios, { AxiosRequestConfig } from 'axios'
import StatusCodes from 'http-status-codes'
import { useStore } from "@/store/adminStore";
import { Ref } from 'vue';
import { RawSessionResponse, Session } from '@/interfaces/SessionInterfaces';

const { OK } = StatusCodes;


export abstract class ProviderBase {
  public static readonly API_BASE_URL: string = process.env.VUE_APP_API_BASE_URL || 'not_a_real_url';

  /**
   * The JWT token returned from server, for the session, with an expiry date
   */
  protected accessTokenRef: Ref<string>;

  /**
   * The JWT token returned from server, for the session, with NO expiry date
   */
  protected refreshTokenRef: Ref<string>;

  /**
   * The JWT token returned from server, for the session, with NO expiry date
   */
  protected sessionRef: Ref<Session>;

  /**
   * A flag to revent endless recursion when refreshing accessToken
   */
  protected isRerunning = false;

  constructor() {
    // Set the access and refresh tokens
    // @TODO should the `store.state.accessToken` & `store.state.refreshToken` be in `store.state.session`?
    const { accessToken, refreshToken, session } = useStore().state;
    this.accessTokenRef = accessToken;
    this.refreshTokenRef = refreshToken;
    this.sessionRef = session;
  }

  /**
   * Get Axois' configuation headers
   * 
   * @returns the configuation for Axios
   */
  protected getAxiosAuthConfig(): AxiosRequestConfig {
    // Requests to admin server routes require an access token.
    const authConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': "application/json",
        'Authorization': `Bearer ${this.accessTokenRef.value}`,
      }
    };
  
    return authConfig;
  }

  /**
   * If a server call was UNAUTHORIZED, try updating the access key
   * 
   * @returns Promise<boolean> whether the access token was refreshed 
   */
  protected async tryRefreshingAccessToken(functionToRerun: () => Promise<boolean>): Promise<boolean> {
    let successfullyRerunFunction = false;
    
    // Stop recursion if function has already rerun
    if (this.isRerunning) {
      console.log('Already rerunning refreshToken(). Stop recursion');
      this.isRerunning = false;
      return false;
    }

    this.isRerunning = true;// Otherwise, turn on the flag

    const updatedAccessToken = await this.refreshAccessToken();

    // If we updated the access token, try rerunning the function with the new access token
    if (updatedAccessToken) {
      console.log(`Successfully updated access token`);
      successfullyRerunFunction = await functionToRerun();
    }
    else {
      useStore().methods.clearSession();
      window.location.reload();
      console.log(`Could not update access token`);
    }
    // Turn off the flag
    this.isRerunning = false;
    
    return successfullyRerunFunction;
  }

  /**
   * Update the access key if possible
   * 
   * @returns Promise<boolean> whether the access token was refreshed 
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      console.log(`The old refresh token: ${this.refreshTokenRef.value}`);
      const response = await axios.post(`${ProviderBase.API_BASE_URL}/session/newToken`,
        {
          refreshToken: this.refreshTokenRef.value,
          userId: this.sessionRef.value.userId,
        },
        this.getAxiosAuthConfig());
      console.log(`Response from the axios put: ${JSON.stringify(response, null, 2)}`);
      const status: number = response.status;

      console.log(`Response status was: ${status} - ${response.statusText}`);

      if (status === OK) {
        const responseData: RawSessionResponse = response.data;
        console.log(`Old access token: ${this.accessTokenRef.value}. New access token: ${responseData.accessToken}`);
        this.accessTokenRef.value = responseData.accessToken;
        return true;
      }
      else {
        console.log(`Error from the axios session newToken post. Status was: ${status} - ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.log(`Error from the axios session newToken post: ${error}`);
      return false;
    }
  }
}
