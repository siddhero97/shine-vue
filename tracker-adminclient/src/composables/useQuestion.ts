import CategoryEntityProvider from "@/providers/CategoryEntityProvider";
import QuestionEntityProvider from "@/providers/QuestionEntityProvider";
import { useStore } from "@/store/adminStore";
import { useEntity } from "./useEntity";

export const useQuestion = () => {
  // This is what we "export"
  const store = useStore();
  const questionProvider = new QuestionEntityProvider();
  const categoryProvider = new CategoryEntityProvider();
  const { loadAsync, submitAsync, clearAll } = useEntity(questionProvider, store.state.questionId, store.state.question);

  return {
    question: store.state.question,
    categoryList: store.state.categoryList,
    loadQuestionAsync: loadAsync,
    submitQuestionAsync: submitAsync,
    fetchAllCategoriesAsync: categoryProvider.fetchAllAsync,
    clearAll: clearAll,
  };
};