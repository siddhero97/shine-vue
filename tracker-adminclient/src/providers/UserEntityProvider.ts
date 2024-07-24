import { UserAttributes } from '@/interfaces/UserInterfaces'
import {
  RawFetchedEntity,
  EntityProvider,
} from '@/providers/EntityProvider';

export default class UserEntityProvider extends EntityProvider<UserAttributes> {
  protected API_ENTITY_URL = `${EntityProvider.API_BASE_URL}/users`;
  
  /**
   * Sends updated entities responses to the server.
   *
   * @async
   * @param rawUserResponse The updated entities responses to send to the server.
   * @returns A promise resolving true if the submission succeeded or resolving to
   * false if it failed.
   */
  public async updateAsync(rawUserResponse: RawFetchedEntity<UserAttributes>): Promise<boolean> {

    // Process response to avoid unintentional database updates or errors
    rawUserResponse = this.processRawUserResponse(rawUserResponse);

    return super.updateAsync(rawUserResponse);
  }

  
  /**
   * Sends updated entities responses to the server.
   *
   * @async
   * @param rawUserResponse The updated entities responses to send to the server.
   * @returns A promise resolving true if the submission succeeded or resolving to
   * false if it failed.
   */
  public async createAsync(rawUserResponse: RawFetchedEntity<UserAttributes>): Promise<boolean> {

    // Process response to avoid unintetional database updates or errors
    rawUserResponse = this.processRawUserResponse(rawUserResponse);

    return super.createAsync(rawUserResponse);
  }

  private processRawUserResponse(responseToProcess: RawFetchedEntity<UserAttributes>)
    : RawFetchedEntity<UserAttributes> {

    // Set email to null (sequelize bug)
    if (responseToProcess.data?.email?.length === 0) {
      responseToProcess.data.email = undefined;
    }

    // If no password, set it to undefined to avoid updating it
    if (responseToProcess.data?.password?.length === 0) {
      responseToProcess.data.password = undefined;
    }

    return responseToProcess;
  }
}
