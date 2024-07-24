import { Category, CategorySubmission } from '@/interfaces/CategoryInterfaces';
import { Question, QuestionSubmission } from '@/interfaces/QuestionInterfaces';
import { Survey, SurveySubmission } from '@/interfaces/SurveyInterfaces';

//
// --- EXTRACTS A SURVEY SUBMISSION OBJECT FROM A SURVEY OBJECT ---
//

export interface UseSurveySubmissionExtractorPublic {
  extractSurveySubmission: (survey: Survey) => SurveySubmission;
}

export const useSurveySubmissionExtractor = (): UseSurveySubmissionExtractorPublic => {
  const extractQuestionSubmission = (question: Question): QuestionSubmission => {
    return {
      questionId: question.properties.questionId,
      answer: question.state.answer
    }
  };

  const extractCategorySubmission = (category: Category): CategorySubmission => {
    return {
      categoryId: category.properties.categoryId,
      tookPart: category.state.tookPart,
      qstnSubmissions: category.nested.map(extractQuestionSubmission)
    }
  };

  const extractSurveySubmission = (survey: Survey): SurveySubmission => {
    return {
      surveyId: survey.properties.surveyId,
      catSubmissions: survey.nested.map(extractCategorySubmission)
    }
  };

  // This is what we "export"
  return {
    extractSurveySubmission
  };
};
