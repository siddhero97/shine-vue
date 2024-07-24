import axios, { AxiosError } from 'axios'
import { EntityAttributes } from '@/interfaces/Entity';
import StatusCodes from 'http-status-codes'
import { ProviderBase } from './ProviderBase';

const { NO_CONTENT, OK, CREATED } = StatusCodes;

//
// --- EXPORTED INTERFACES ---
//
export interface RawFetchedEntity<EntityAttributesType extends EntityAttributes> {
  data: EntityAttributesType;
}

export interface RawFetchedEntities<EntityAttributesType extends EntityAttributes> {
  data: EntityAttributesType[];
}


export abstract class EntityProvider<EntityAttributesType extends EntityAttributes> extends ProviderBase {
  public static readonly API_BASE_URL: string = process.env.VUE_APP_API_BASE_URL || 'not_a_real_url';
  protected abstract API_ENTITY_URL: string;
  
  /**
   * Get a formatted timestamp from a date object - for logging purposes.
   * @TODO Where should this function go?
   *
   * @param dateTime The Date object that we want to format into a timestamp for
   *  logging.
   * @returns A string containing a formatted timestamp.
   */
  public getFormattedTimestamp(dateTime: Date): string {
    return `${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}.${dateTime.getMilliseconds()}`;
  }

  /**
   * Fetches a single entity from the server.
   *
   * @async
   * @param entityId The id of the entity we want to load.
   * @param axoisUrl The url to fetch from. Replaces '@' with the default URL
   * @returns A promise resolving to the fetched entity or null if the entity wasn't found
   */
  public fetchAsync = async (entityId: number, axoisUrl = '@'): Promise<RawFetchedEntity<EntityAttributesType> | null> => {
    let fetchedEntity: RawFetchedEntity<EntityAttributesType> | null = null;

    try {
      // Fetch (get) all the entities.
      const responseForEntity = await axios.get(axoisUrl.replace('@', `${this.API_ENTITY_URL}/${entityId}`), this.getAxiosAuthConfig());
      const status = responseForEntity.status;

      console.log(`Fetch All Async response status was: ${status} - ${responseForEntity.statusText}`);

      if (status !== OK) {
        return null;
      }

      fetchedEntity = (responseForEntity.data as RawFetchedEntity<EntityAttributesType>);

      console.log(`Entity data from the axios get: ${JSON.stringify(fetchedEntity, null, 2)}`);
    } catch (error) {

      // If accessToken doesn't work, try refreshing it
      // if (error.response.status === UNAUTHORIZED) {
        const accessTokenWasRefreshed = await this.tryRefreshingAccessToken(async () => {
          fetchedEntity = await this.fetchAsync(entityId);
          return true; // To satisfy Typescript
        });
      
        if (accessTokenWasRefreshed) {
          console.log(`Axios refresh token was successfully updated`);
          return fetchedEntity;
        }
      // }

      console.log(`Error from the axios get: ${error}`);
    }

    return fetchedEntity;
  }

  /**
   * Fetches multiple entities from the server.
   *
   * @async
   * @param axoisUrl The url to fetch from. Replaces '@' with the default URL
   * @returns A promise resolving to the fetched entities or null if there's an error
   */
  public fetchAllAsync = async (axoisUrl = '@'): Promise<RawFetchedEntities<EntityAttributesType> | null> => {
    let fetchedEntities: RawFetchedEntities<EntityAttributesType> | null = null;

    // Fetch (get) all the entities
    await axios.get(axoisUrl.replace('@', `${this.API_ENTITY_URL}`), this.getAxiosAuthConfig())
      .then(responseForEntities => {
        const status = responseForEntities.status;

        console.log(`Fetch All Async response status was: ${status} - ${responseForEntities.statusText}`);

        if (status !== OK) {
          return null;
        }

        fetchedEntities = (responseForEntities.data as RawFetchedEntities<EntityAttributesType>);
      })
      .catch(async (error : AxiosError) => {

        // console.log(JSON.stringify(error));

        // If accessToken doesn't work, try refreshing it
        // if (error.response.status === UNAUTHORIZED) {
          // console.log(`Axois resopnse was UNAUTHORIZED`);
          const accessTokenWasRefreshed = await this.tryRefreshingAccessToken(async () => {
            fetchedEntities = await this.fetchAllAsync();
            return true; // To satisfy Typescript
          });

          if (accessTokenWasRefreshed) {
            console.log(`Axois refresh token was successfully updated`);
            return fetchedEntities;
          }
        // }
        console.log(`Error from the axios get: ${error}`);

        return null;
      });
    
    return fetchedEntities;
  }
  /**
   * Sends updated entities responses to the server.
   *
   * @async
   * @param rawEntityResponse The updated entities responses to send to the server.
   * @returns A promise resolving true if the submission succeeded or resolving to
   * false if it failed.
   */
   public async updateAsync(rawEntityResponse: RawFetchedEntity<EntityAttributesType>): Promise<boolean> {
    console.log(`In updateAsync - put data with axios...`);
    try {
      const response = await axios.put(`${this.API_ENTITY_URL}/${rawEntityResponse.data.id}`,
        rawEntityResponse,
        this.getAxiosAuthConfig());
      console.log(`Response from the axios put: ${JSON.stringify(response, null, 2)}`);
      const status: number = response.status;
      console.log(`Response status was: ${status} - ${response.statusText}`);

      return (status === OK || status === NO_CONTENT); // true if status is a success one, false otherwise
    } catch (error) {

      // If accessToken doesn't work, try refreshing it
      // if (status === UNAUTHORIZED) {
        const successfulSecondTime =
          await this.tryRefreshingAccessToken(() => this.updateAsync(rawEntityResponse));
        if (successfulSecondTime) return successfulSecondTime;
      // }

      console.log(`Error from the axios put: ${error}`);
      return false;
    }
  }
  /**
   * Sends updated entities responses to the server.
   *
   * @async
   * @param rawEntityResponse The updated entities responses to send to the server.
   * @returns A promise resolving true if the submission succeeded or resolving to
   * false if it failed.
   */
  public async createAsync(rawEntityResponse: RawFetchedEntity<EntityAttributesType>): Promise<boolean> {
    console.log(`In createAsync - put data with axios...`);
    try {
      const response = await axios.post(`${this.API_ENTITY_URL}`,
        rawEntityResponse,
        this.getAxiosAuthConfig());
      
      console.log(`Response from the axios put: ${JSON.stringify(response, null, 2)}`);
      const status: number = response.status;
      console.log(`Response status was: ${status} - ${response.statusText}`);

      return (status === OK || status === NO_CONTENT || status == CREATED); // true if status is a success one, false otherwise
    } catch (error) {

      // If accessToken doesn't work, try refreshing it
      // if (status === UNAUTHORIZED) {
        const successfulSecondTime =
          await this.tryRefreshingAccessToken(() => this.createAsync(rawEntityResponse));
        if (successfulSecondTime) return successfulSecondTime;
      // }

      console.log(`Error from the axios put: ${error}`);
      return false;
    }
  }

  /**
   * Delete an entity
   *
   * @async
   * @param entityId The updated entity responses to send to the server.
   * @returns A promise resolving true if the submission succeeded or resolving to
   * false if it failed.
   */
  public async deleteAsync(entityId: number): Promise<boolean> {
    console.log(`In deleteAsync - delete entity ${entityId} with axios...`);
    try {
      const response = await axios.delete(`${this.API_ENTITY_URL}/${entityId}`, this.getAxiosAuthConfig());

      console.log(`Response from the axios put: ${JSON.stringify(response, null, 2)}`);
      const status: number = response.status;
      console.log(`Response status was: ${status} - ${response.statusText}`);

      return (status === OK || status === NO_CONTENT); // true if status is a success one, false otherwise
    } catch (error) {

      // If accessToken doesn't work, try refreshing it
      // if (status === UNAUTHORIZED) {
        const successfulSecondTime =
          await this.tryRefreshingAccessToken(() => this.deleteAsync(entityId));
        if (successfulSecondTime) return successfulSecondTime;
      // }
      console.log(`Error from the axios put: ${error}`);
      return false;
    }
  }
}
