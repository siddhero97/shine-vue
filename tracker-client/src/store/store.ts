/***
 * store.ts
 *
 * Shared state within the survey app instance (one survey in one browser tab)
 */

import { Survey, SurveyAnswerServerValidationError, SurveyMetadata, SurveySubmitResult, SurveySubmission } from '@/interfaces/SurveyInterfaces'
import { ref, Ref } from 'vue';

/* ---
 * HELPERS (private to this module)
 * ---
 */

const createEmptySurveyMetadata = (): SurveyMetadata => {
  return {
    surveyId: 0,
    displayName: 'Unknown User',
    surveyDate: 'Unknown Date',
    status: 'created',
    catMetaList: []
  };
}

const createEmptySurveySubmission = (): SurveySubmission => {
  return {
    surveyId: 0,
    catSubmissions: []
  }
}

const createEmptySurvey = (): Survey => {
  return {
    properties: createEmptySurveyMetadata(),
    nested: []
  }
}

/**
 * Singleton state: whether or not the access key is authenticated (from the server)
 */
const isAuthenticated: Ref<boolean> = ref(false);

/**
 * Singleton state: whether or not the survey is loaded (from the server)
 */
const isLoaded: Ref<boolean> = ref(false);

/**
 * Singleton state: reactive access token
 */
const accessToken: Ref<string> = ref('');

/**
 * Singleton state: reactive result message to display from submitting the survey.
 *
 * The message is one of:
 * - '' (survey hasn't been submitted yet since being opened this time around)
 * - a success message
 * - an overall error message.
 */
const trimmedSubmitResultMessage: Ref<string> = ref('');

/**
 * Singleton state: reactive array of server validation errors.
 *
 * TODO: Or should this be an array of already-processed messages???
 */
const serverValidationErrors: Ref<SurveyAnswerServerValidationError[]> = ref([]);

/**
 * Singleton state: reactive survey ID
 */
const surveyId: Ref<number> = ref(0);

/**
 * Singleton state: survey metadata (initialized as minimal object to satisfy TS)
 *
 * TODO: Do we keep surveymetadata/surveysubmission or just survey in the store???
 */
const surveyMetadata: Ref<SurveyMetadata> = ref(createEmptySurveyMetadata());

/**
 * Singleton state: reactive survey submission object (initialized as minimal
 * object to satisfy TS)
 *
 * TODO: Do we keep surveymetadata/surveysubmission or just survey in the store???
 */
const surveySubmission: Ref<SurveySubmission> = ref(createEmptySurveySubmission());

/**
 * Singleton state: reactive survey object (initialized as minimal
 * object to satisfy TS)
 *
 * TODO: Do we keep surveymetadata/surveysubmission or just survey in the store???
 */
const survey: Ref<Survey> = ref(createEmptySurvey());

/**
 * The underlying combined shared state.
 */
const store = {
  state: { // Exposed state from the store
    // TODO: More parts of this state shouldn't be exposed
    isLoaded,
    surveyId,
    surveyMetadata,
    surveySubmission,
    survey
  },

  getters: {
    getAccessToken(): string {
      return accessToken.value;
    },

    getIsAuthenticated(): boolean {
      return isAuthenticated.value;
    },

    getTrimmedSubmitResultMessage(): string {
      return trimmedSubmitResultMessage.value;
    },

    getServerValidationErrors(): Array<SurveyAnswerServerValidationError> {
      return serverValidationErrors.value;
    }
  },

  // TODO: Call these mutations (to be closer to Vuex terminology)
  methods: {
    clearState(): void {
      isAuthenticated.value = false;
      isLoaded.value = false;
      accessToken.value = '';
      trimmedSubmitResultMessage.value = '';
      serverValidationErrors.value = [];
      surveyId.value = 0;
      surveyMetadata.value = createEmptySurveyMetadata();
      surveySubmission.value = createEmptySurveySubmission();
      survey.value = createEmptySurvey();
    },

    setAccessToken(newAccessToken: string): void {
      accessToken.value = newAccessToken ?? '';
      isAuthenticated.value = (accessToken.value.length > 0); // authenticated when there is an access token
    },

    setSurveySubmitResult(newResult: SurveySubmitResult): void {
      trimmedSubmitResultMessage.value = newResult.message.trim();
      serverValidationErrors.value = newResult.validationErrors;
    }
  },
};


/* ---
 * EXPORTS
 * ---
 */

/**
 * EXPORT: useStore - returns the store for shared state
 */
export const useStore = () => {
  return store;
}
