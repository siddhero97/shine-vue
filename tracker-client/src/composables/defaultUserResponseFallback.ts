import { QuestionMetadata } from "@/interfaces/QuestionInterfaces";

//
// --- EXPORTED FUNCTIONS ---
//

export interface UseDefaultUserResponseFallbackPublic {
  computeDefaultAnswerFromType: (qstnMeta: QuestionMetadata) => any;
  getDefaultCategoryTookPart: () => boolean;
}

export const useDefaultUserResponseFallback = (): UseDefaultUserResponseFallbackPublic => {
  /**
   * Computes a default fallback answer based on the question's data type (answer
   * type). This fallback is normally used when a question does not have a
   * default user response.
   *
   * @param qstnMeta The metadata for the question that we need to compute a
   * default answer for (because the question doesn't have a default user
   * response).
   *
   * @returns The default answer for the given data type (answer type).
   */
  const computeDefaultAnswerFromType = (qstnMeta: QuestionMetadata): any => {
    // Default answers are based on the answer type. Some types (such as shorttext
    // and longtext) return the same value. We could have used a multi-criteria
    // case statement (per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch#methods_for_multi-criteria_case).
    // However, for clarity the answer types are listed in alphabetical order and
    // each one has its own case/return statement.
    switch (qstnMeta.answerType) {
      case 'boolean':
        return false;
      case 'longtext':
        return '';
      case 'multiselect':
        return [];
      case 'number':
        return 0;
      case 'select': // return the numeric value of the first option, or 0 if there are no options
        return qstnMeta.options?.[0]?.[0] ?? 0;
      case 'shorttext':
        return '';
      default:
        return '';
    }
  };

  /**
   * Gets the default fallback value of the "tookPart" flag for a category. This
   * fallback is normally used when a category does not have a default user\
   * response.
   *
   * @returns The default fallback value of the "tookPart" flag for a category.
   * Currently this default fallback value is false (meaning the user didn't
   * take part in that category's activity for the given survey).
   */
  const getDefaultCategoryTookPart = (): boolean => {
    return false;
  }

  return {
    computeDefaultAnswerFromType,
    getDefaultCategoryTookPart,
  };
}
