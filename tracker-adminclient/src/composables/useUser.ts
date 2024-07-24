import { CategoryAttributes } from "@/interfaces/CategoryInterfaces";
import CategoryEntityProvider from "@/providers/CategoryEntityProvider";
import { RawFetchedEntities } from "@/providers/EntityProvider";
import UserEntityProvider from "@/providers/UserEntityProvider";
import { useStore } from "@/store/adminStore";
import { useEntity } from "./useEntity";

export const useUser = (): any => {
  // This is what we "export"
  const store = useStore();
  const userProvider = new UserEntityProvider();
  const categoryProvider = new CategoryEntityProvider();
  const { loadAsync, submitAsync, clearAll }
    = useEntity(userProvider, store.state.userId, store.state.user);

  // @TODO Abstract this function to allow DRY code. Should we just use `useCategory()`?
  const getRawCategoriesAsync = async (): Promise<RawFetchedEntities<CategoryAttributes> | null> => {
    return categoryProvider.fetchAllAsync();
  }

  return {
    user: store.state.user,
    categoryList: store.state.categoryList,
    loadUserAsync: loadAsync,
    submitUserAsync: submitAsync,
    getRawCategoriesAsync,
    clearAll: clearAll,
  };
};
