import { VueLogger } from 'vue-logger-plugin';
import { CategoryMetadata } from '@/interfaces/CategoryInterfaces';
import { QuestionMetadata } from '@/interfaces/QuestionInterfaces';
import { SurveyAnswerServerValidationError, SurveyMetadata } from '@/interfaces/SurveyInterfaces';

//
// --- BUILDS VALIDATION MESSAGES FROM RAW SERVER-SIDE VALIDATION ERRORS ---
//

export interface UseValidationMessageBuilderPublic {
  buildServerValidationErrorMessages: (validationErrors: Array<SurveyAnswerServerValidationError>, surveyMetadata: SurveyMetadata) => Array<string>;
}

export const useValidationMessageBuilder = (logger: VueLogger): UseValidationMessageBuilderPublic => {
  const buildServerValidationErrorMessages = (validationErrors: Array<SurveyAnswerServerValidationError>, surveyMetadata: SurveyMetadata): Array<string> => {
    const errorMessages: Array<string> = [];

    // NOTE: A survey tends to have a relatively small number of questions and
    //       categories, and there should (hopefully) not be too many validation
    //       errors, so we are not optimizing the way we match each validation
    //       error to its category name and question prompt.
    validationErrors.forEach(validationError => {
      let categoryDescription: string;
      let questionPrompt: string;

      const errorCategoryId = validationError.categoryId;
      const errorQuestionId = validationError.questionId;

      logger.debug(`buildServerValidationErrorMessages: Validation error is for categoryId=${errorCategoryId}, questionId=${errorQuestionId}`)
      const matchingCategoryMeta: CategoryMetadata | undefined = surveyMetadata.catMetaList.find(catMeta => {
        return catMeta.categoryId === errorCategoryId;
      });

      if (typeof matchingCategoryMeta !== 'undefined') {
        categoryDescription = matchingCategoryMeta.description;

        const matchingQuestionMeta: QuestionMetadata | undefined =
          matchingCategoryMeta.qstnMetaList.find(qstnMeta => {
            return qstnMeta.questionId === errorQuestionId;
          });

        if (typeof matchingQuestionMeta !== 'undefined') {
          questionPrompt = matchingQuestionMeta.questionPrompt;
        } else {
          questionPrompt = `(UNKNOWN question ID ${errorQuestionId})`;
        }
      } else {
        categoryDescription = `(UNKNOWN category ID ${errorCategoryId})`;
        questionPrompt = `(UNKNOWN question ID ${errorQuestionId})`;
      }

      errorMessages.push(`[${categoryDescription}] ${questionPrompt}: '${validationError.validationName}' validation failed - ${validationError.message}`);
    });

    return errorMessages;
  };

  // This is what we "export"
  return {
    buildServerValidationErrorMessages
  };
};
