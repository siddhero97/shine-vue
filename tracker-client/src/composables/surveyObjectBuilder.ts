import { reactive } from 'vue';
import { VueLogger } from 'vue-logger-plugin';
import { useDefaultUserResponseFallback } from '@/composables/defaultUserResponseFallback';
import { Category, CategoryMetadata, CategorySubmission } from '@/interfaces/CategoryInterfaces';
import { Question, QuestionMetadata, QuestionSubmission } from '@/interfaces/QuestionInterfaces';
import { Survey, SurveyMetadata, SurveySubmission } from '@/interfaces/SurveyInterfaces';

//
// --- BUILDS A SURVEY OBJECT FROM METADATA AND SUBMISSION DATA ---
//

export interface UseSurveyObjectBuilderPublic {
  buildSurveyObject: (surveyMetadata: SurveyMetadata, surveySubmission: SurveySubmission) => Survey;
}

export const useSurveyObjectBuilder = (logger: VueLogger): UseSurveyObjectBuilderPublic => {
  const { computeDefaultAnswerFromType, getDefaultCategoryTookPart } = useDefaultUserResponseFallback();

  const buildQuestion = (metadata: QuestionMetadata, submission: QuestionSubmission): Question => {
    return {
      properties: metadata,
      state: reactive({
        answer: submission.answer
      })
    }
  };

  const buildQuestions = (qstnMetaList: Array<QuestionMetadata>, qstnSubmissions: Array<QuestionSubmission>): Array<Question> => {
    const questions: Array<Question> = [];

    qstnMetaList.forEach(qstnMeta => {
      // Find the matching question submission (if it exists)
      const matchingQstnSubmission: QuestionSubmission | undefined =
        qstnSubmissions.find(qstnSubmission => {
          return qstnSubmission.questionId === qstnMeta.questionId;
        });

      if (!matchingQstnSubmission) {
        logger.debug(`Couldn't find matching question for ${qstnMeta.questionId}`);
      }

      // Use either the matching one or an "initial" submission object that's
      // defaulted to the default values from the question metadata.
      const qstnSubmission: QuestionSubmission =
        matchingQstnSubmission ??
        {
          questionId: qstnMeta.questionId,
          answer: qstnMeta.defaultUserResponse?.answer ??
            computeDefaultAnswerFromType(qstnMeta)
        };

      const question: Question = buildQuestion(qstnMeta, qstnSubmission);
      questions.push(question);
    });

    return questions;
  };

  const buildCategory = (metadata: CategoryMetadata, submission: CategorySubmission): Category => {
    const questions: Array<Question> = buildQuestions(
      metadata.qstnMetaList, submission.qstnSubmissions);

    return {
      properties: metadata,
      state: reactive({
        tookPart: submission.tookPart
      }),
      nested: questions
    };
  };

  const buildCategories = (catMetaList: Array<CategoryMetadata>, catSubmissions: Array<CategorySubmission>): Array<Category> => {
    const categories: Array<Category> = [];

    catMetaList.forEach(catMeta => {
      // Find the matching category submission (if it exists)
      const matchingCatSubmission: CategorySubmission|undefined =
        catSubmissions.find(catSubmission => {
          return catSubmission.categoryId === catMeta.categoryId;
        });

      if (!matchingCatSubmission) {
        logger.debug(`Couldn't find matching category for ${catMeta.categoryId}`);
      }

      // Use either the matching one or an "initial" submission object that's
      // defaulted to the default values from the category metadata.
      const catSubmission: CategorySubmission =
        matchingCatSubmission ??
        {
          categoryId: catMeta.categoryId,
          tookPart: catMeta.defaultUserResponse?.tookPart ?? getDefaultCategoryTookPart(),
          qstnSubmissions: [] // questions will be defaulted later
        };

      const category: Category = buildCategory(catMeta, catSubmission);
      categories.push(category);
    });

    return categories;
  };

  const buildSurveyObject = (surveyMetadata: SurveyMetadata, surveySubmission: SurveySubmission): Survey => {
    const categories: Array<Category> = buildCategories(surveyMetadata.catMetaList, surveySubmission.catSubmissions);
    return {
      properties: surveyMetadata,
      nested: categories
    }
  };

  // This is what we "export"
  return {
    buildSurveyObject
  };
};
