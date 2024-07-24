import CategoryEntityProvider from "@/providers/CategoryEntityProvider";
import { useStore } from "@/store/adminStore";
import { useEntity } from "./useEntity";

export const useCategory = () => {
  // This is what we "export"
  const store = useStore();
  const categoryProvider = new CategoryEntityProvider();
  const { loadAsync, submitAsync, clearAll } = useEntity(categoryProvider, store.state.categoryId, store.state.category);

  return {
    category: store.state.category,
    loadCategoryAsync: loadAsync,
    clearAll: clearAll,
    submitCategoryAsync: submitAsync,
  };
};