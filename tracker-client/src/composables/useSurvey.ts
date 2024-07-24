import { computed, reactive, ref, Ref } from 'vue';
import { VueLogger } from 'vue-logger-plugin';
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router';
import { useDefaultUserResponseFallback } from '@/composables/defaultUserResponseFallback';
import { useSurveyObjectBuilder } from '@/composables/surveyObjectBuilder';
import { useSurveySubmissionExtractor } from '@/composables/surveySubmissionExtractor';
import { useTypeConversionHelpers } from '@/composables/typeConversionHelpers';
import { SurveySubmitResult, SurveySubmission, Survey, SurveyAnswerServerValidationError } from '@/interfaces/SurveyInterfaces';
import { fetchSurveyAsync, RawFetchedSurvey, updateSurveySubmissionAsync } from '@/providers/SurveyProvider';
import { useStore } from '@/store/store'

//
// --- EXPORTED FUNCTIONS ---
//

export interface UseSurveyPublic {
  survey: Ref<Survey>;
  getTrimmedSubmitResultMessage: () => string;
  getServerValidationErrors: () => SurveyAnswerServerValidationError[];
  loadSurveyAsync: () => Promise<void>;
  clearAll: () => void;
  submitSurveyAsync: () => Promise<boolean>;
}

export const useSurvey = (logger: VueLogger): UseSurveyPublic => {
  const route: RouteLocationNormalizedLoaded = useRoute();
  const store = useStore();
  const { surveyId, isLoaded, surveyMetadata, surveySubmission, survey } = store.state;
  const { getAccessToken, getIsAuthenticated, getTrimmedSubmitResultMessage, getServerValidationErrors } = store.getters;
  const { setSurveySubmitResult } = store.methods;
  const { convertRouteParamToNumber } = useTypeConversionHelpers();
  const { buildSurveyObject } = useSurveyObjectBuilder(logger);
  const { computeDefaultAnswerFromType, getDefaultCategoryTookPart } = useDefaultUserResponseFallback();
  const { extractSurveySubmission } = useSurveySubmissionExtractor();

  // NOTE: This function must be called before initializing the user survey or
  //       summary.
  const getSurveyIdFromRoute = (): number => {
    // We need special code to make sure the survey ID is parsed as a number.
    return convertRouteParamToNumber(route.params.surveyId as string);
  }

  // Use the already-loaded survey or load it from the server.
  const loadSurveyAsync = async (): Promise<void> => {
    // TODO: Figure out the best way to deal with lack of authentication
    if (!getIsAuthenticated()) {
      logger.error(`Failed to load survey - not authenticated`);
      isLoaded.value = false; // make sure
      return;
    }

    if (isLoaded.value) {
      logger.debug(`In loadSurveyAsync: survey ${surveyId.value} is already loaded - no need to go to server`);
      return; // store is already loaded
    }

    const currentSurveyId: number = getSurveyIdFromRoute();
    surveyId.value = currentSurveyId; // make sure the state is updated properly

    logger.info(`Loading survey ${currentSurveyId}...`);
    const fetchedSurvey: RawFetchedSurvey | null = await fetchSurveyAsync(currentSurveyId, getAccessToken(), logger);
    if (fetchedSurvey === null) {
      logger.debug(`Failed to load survey ${currentSurveyId} - fetchedSurvey was null`);
      isLoaded.value = false; // make sure
      return;
    }

    logger.debug(`TODO: fetchedSurvey is:\n${JSON.stringify(fetchedSurvey, null, 2)}`);

    // Update the rest of the singleton store's state.
    surveyMetadata.value = fetchedSurvey.metadata;
    surveySubmission.value = fetchedSurvey.submission;
    survey.value = buildSurveyObject(surveyMetadata.value, surveySubmission.value);
    isLoaded.value = true;
  };

  const clearAll = (): void => {
    logger.info(`Clearing answers for survey ${surveyId.value}...`);
    logger.debug(`Survey ID from stored survey whose answers we want to clear: ${survey.value.properties.surveyId}`);
    survey.value.nested.forEach(category => {
      logger.debug(`In clearAll: category '${category.properties.description}' (${category.properties.categoryId}) - tookPart was: ${category.state.tookPart}`);
      category.state = reactive({
        tookPart: category.properties.defaultUserResponse?.tookPart ?? getDefaultCategoryTookPart()
      });
      logger.debug(`In clearAll: category '${category.properties.description}' (${category.properties.categoryId}) - tookPart reset to: ${category.state.tookPart}`);

      category.nested.forEach(question => {
        logger.debug(`In clearAll: question '${question.properties.questionPrompt}' (${question.properties.questionId}) - answer was: ${JSON.stringify(question.state.answer, null, 2)}`);
        question.state = reactive({
          answer: question.properties.defaultUserResponse?.answer ?? computeDefaultAnswerFromType(question.properties)
        });
        logger.debug(`In clearAll: question '${question.properties.questionPrompt}' (${question.properties.questionId}) - answer reset to: ${JSON.stringify(question.state.answer, null, 2)}`);
      })
    });
  };

  const submitSurveyAsync = async (): Promise<boolean> => {
    // TODO: Figure out the best way to deal with lack of authentication
    if (!getIsAuthenticated()) {
      logger.error(`Failed to submit survey - no longer authenticated`);
      return false;
    }

    const newSubmission: SurveySubmission = extractSurveySubmission(survey.value);

    logger.info(`Submitting survey ${newSubmission.surveyId}...`);
    logger.debug(`Submission data is:\n${JSON.stringify(newSubmission, null, 2)}`);
    logger.debug(`useSurvey.onSubmit: before updateSurvey async call`);

    const result: SurveySubmitResult = await updateSurveySubmissionAsync(newSubmission, getAccessToken(), logger);
    setSurveySubmitResult(result); // update the state of the store with this result

    const wasAccepted: boolean = result.wasAccepted;
    logger.debug(`useSurvey.onSubmit: after updateSurvey resolved - wasAccepted = ${wasAccepted}`);
    if (wasAccepted) {
      // Only update the store's surveySubmission data if the server accepted
      // the submission.
      surveySubmission.value = newSubmission;
    }

    return wasAccepted;
  };

  // This is what we "export"
  return {
    survey,
    getTrimmedSubmitResultMessage, // TODO: Is this the right place to expose this???
    getServerValidationErrors, // TODO: Is this the right place to expose this???
    loadSurveyAsync,
    clearAll,
    submitSurveyAsync,
  };
};

// This is for debugging purposes. Debug information is only available in
// development mode.
export interface UseSurveyDebugPublic {
  isSurveyDebugAvailable: boolean,
  debugSurveyNested: Ref<string>;
  debugSurveyProperties: Ref<string>;
}

// This is for debugging purposes. Debug information is only available in
// development mode.
export const useSurveyDebug = (): UseSurveyDebugPublic => {
  let debugSurveyNested: Ref<string>;
  let debugSurveyProperties: Ref<string>;

  const isSurveyDebugAvailable: boolean = (process.env.NODE_ENV?.toLowerCase() === 'development');
  if (isSurveyDebugAvailable) {
    const store = useStore();
    const { survey } = store.state;
    debugSurveyNested = computed(() => JSON.stringify(survey.value.nested, null, 2));
    debugSurveyProperties = computed(() => JSON.stringify(survey.value.properties, null, 2));
  } else {
    debugSurveyNested = ref('');
    debugSurveyProperties = ref('');
  }

  return {
    isSurveyDebugAvailable,
    debugSurveyNested,
    debugSurveyProperties
  }
}
