import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router';
import { Ref } from 'vue';
import {
  RawFetchedEntity,
  EntityProvider,
} from '@/providers/EntityProvider';
import { Entity, EntityAttributes } from '@/interfaces/Entity';
import { useStore } from '@/store/adminStore';

//
// --- EXPORTED FUNCTIONS ---
//
 
// eslint-disable-next-line 
export const useEntity = <EntityAttributesType extends EntityAttributes>
  (entityProvider: EntityProvider<EntityAttributesType>, entityId: Ref<number>, entity: Ref<Entity<EntityAttributesType>>) => {
  
  const route: RouteLocationNormalizedLoaded = useRoute();
  const store = useStore();

  // NOTE: This function must be called before initializing the entity
  const getRouteIdFromRoute = (): number => {
    // We need special code to make sure the entity ID is parsed as a number.
    return convertRouteParamToNumber(route.params.entityId as string);
  }

  // Use the already-loaded entity or load it from the server.
  const loadAsync = async (axoisUrl?: string): Promise<void> => {
    entityId.value = getRouteIdFromRoute();
    
    if (entity.value.state.id === entityId.value) {
      console.log(`In loadAsync: entity ${entityId.value} is already loaded - no need to go to server`);
      return; // store is already loaded
    }

    if (entityId.value < 1) {  // 0 used for to flag the entity for creation (had trouble using -1)
      console.log(`In loadAsync: create a new entity`);
      clearAll();
      return; // entity just needs to be created
    }

    console.log(`Loading entity ${entityId}`);
    const fetchedEntity = await entityProvider.fetchAsync(entityId.value, axoisUrl);
    if (fetchedEntity === null) {
      console.warn(`Failed to load entity ${entityId} - fetchedEntity was null`);
      return;
    }

    console.log(`TODO: fetchedEntity is:\n${JSON.stringify(fetchedEntity, null, 2)}`);

    entity.value = {
      state: fetchedEntity.data,
    };
  }

  const clearAll = (): void => {
    store.methods.clearState();
  }

  const submitAsync = async (): Promise<boolean> => {
    const rawEntitySubmission: RawFetchedEntity<EntityAttributesType> = {
      data: entity.value.state,
    }

    console.log(`Submitting entity ${rawEntitySubmission.data.id}...`);
    console.log(`Submission data is:\n${JSON.stringify(rawEntitySubmission, null, 2)}`);
    console.log(`useEntity.onSubmit: before updateEntity/createEntity async call`);

    if (entityId.value < 1) {  // 0 used for to flag the entity for creation (had trouble using -1)
      return entityProvider.createAsync(rawEntitySubmission).then((wasSubmissionSuccessful: boolean) => {
        console.log(`useEntity.onSubmit: after updateEntity resolved - wasSubmissionSuccessful = ${wasSubmissionSuccessful}`);
        entity.value.state = rawEntitySubmission.data; // update the store's entity data

        return wasSubmissionSuccessful;
      });
    }
    else {
      return entityProvider.updateAsync(rawEntitySubmission).then((wasSubmissionSuccessful: boolean) => {
        console.log(`useEntity.onSubmit: after updateEntity resolved - wasSubmissionSuccessful = ${wasSubmissionSuccessful}`);
        entity.value.state = rawEntitySubmission.data; // update the store's entity data

        return wasSubmissionSuccessful;
      });
    }
  }

  /**
   * We need special code to convert a numeric URL route parameter from a string
   * into an actual number data type.
   * 
   * @param routeParam definted in routes/index.ts, current always entityId
   * @returns number the route paramter
   */
  const convertRouteParamToNumber = (routeParam: string): number => {
    return Number.parseInt((routeParam as string), 10) || 0;
  }

  return {
    entity,
    entityId,
    loadAsync,
    clearAll,
    submitAsync,
  }
}
