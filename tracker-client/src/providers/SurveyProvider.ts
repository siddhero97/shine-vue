import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import StatusCodes from 'http-status-codes'
import { VueLogger } from 'vue-logger-plugin'
import { SurveyAccess, SurveyAnswerServerValidationError, SurveyMetadata, SurveySubmitResult, SurveySubmission } from '@/interfaces/SurveyInterfaces'

const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NO_CONTENT,
  OK,
  UNPROCESSABLE_ENTITY
} = StatusCodes;

// NOTE: Environment variables are strings
const API_BASE_URL: string = process.env.VUE_APP_API_BASE_URL || 'not_a_real_url';

//
// --- HELPERS ---
//

/**
 * Get a formatted timestamp from a date object - for logging purposes.
 *
 * @param dateTime The Date object that we want to format into a timestamp for
 *  logging.
 * @returns A string containing a formatted timestamp.
 */
const getFormattedTimestamp = (dateTime: Date): string => {
  return `${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}.${dateTime.getMilliseconds()}`;
}

/**
 * Validates that the HTTP response status is OK (200). This handler is added
 * to an Axios call's config so that anything other than OK will result in an
 * error being thrown (as opposed to the default Axios behavior that will
 * resolve the call if the status is in the 2xx range and throw an error if the
 * status is outside of that range).
 *
 * @param status The HTTP response status
 * @returns true if the status is OK (200); false otherwise.
 */
const validateStatusIsOKOnly = (status: number): boolean => {
  return status === OK;
}

//
// --- CONFIGURABLE DEVELOPMENT MODE ONLY HELPERS ---
//

/**
 * Computes the flag indicating whether or not we add an extra delay to each
 * provider call that contacts the server (API). It will only be true if we're in
 * development mode AND if the VUE_APP_DEV_ADD_EXTRA_DELAY environment variable
 * is set and has a value of 'true' (case-insensitive). Otherwise (by default)
 * we don't want to add any delay.
 *
 * @returns true if logging should be enabled; false if it should be disabled.
 */
const computeDevAddExtraDelay = (): boolean => {
  if (process.env.NODE_ENV?.toLowerCase() !== 'development') {
    return false; // Don't add any extra delays outside of development mode
  }

  const devAddExtraDelayConfig: string = process.env.VUE_APP_DEV_ADD_EXTRA_DELAY ?? 'false';
  return devAddExtraDelayConfig.trim().toLowerCase() === 'true';
}

/**
 * Flag indicating whether or not we add an extra delay to each provider call that
 * contacts the server (API). It's only available for a development mode build, in
 * which case it would be based on the VUE_APP_DEV_ADD_EXTRA_DELAY environment
 * variable value.
 */
const DEV_ADD_EXTRA_DELAY: boolean = computeDevAddExtraDelay();

/**
 * DEVELOPMENT MODE ONLY helper to add an extra delay to network calls (to try
 * out delayed responses). This helper only adds the delay when we are in
 * development mode AND the VUE_APP_DEV_ADD_EXTRA_DELAY flag is confgured.
 *
 * @async
 * @param callerName The caller's function name - for logging purposes
 * @param delayMs The number of milliseconds for the extra delay
 * @param logger The Vue logger instance (for outputting log messages)
 */
const devOptionallyAddExtraDelay = async (callerName: string, delayMs: number, logger: VueLogger): Promise<void> => {
  if (DEV_ADD_EXTRA_DELAY) {
    logger.debug(`In ${callerName} at ${getFormattedTimestamp(new Date())} - starting extra ${delayMs}ms delay...`);
    const extraDelay = (ms: number): Promise<number> => new Promise(resolve => setTimeout(resolve, ms))
    await extraDelay(delayMs);
    logger.debug(`In ${callerName} at ${getFormattedTimestamp(new Date())} - finished extra ${delayMs}ms delay`);
  }
}

//
// --- EXPORTED INTERFACES ---
//

/** Represents a raw fetched survey (its metadata and submission records) */
export interface RawFetchedSurvey {
  metadata: SurveyMetadata;
  submission: SurveySubmission;
}

//
// --- EXPORTED FUNCTIONS ---
//

/**
 * Authenticates the access key, returning the associated access token and survey
 * ID if that access key is currently valid.
 *
 * @async
 * @param accessKey The access key for the survey (this is part of the hyperlink
 * that the user is given)
 * @param logger The Vue logger instance (for outputting log messages)
 * @returns A promise resolving to an object containing the access token and
 * survey ID associated with the access key if authentication succeeded, or null
 * if authentication failed (usually meaning there is no survey for that access
 * key or access to the survey has expired).
 */
export const authenticateSurveyAccessAsync = async (accessKey: string, logger: VueLogger): Promise<SurveyAccess | null> => {
  // Mimic network latency in development mode (if that setting is configured).
  await devOptionallyAddExtraDelay('authenticateSurveyAccessAsync', 2000, logger);

  try {
    // Post to the special authentication URL. This should only succeed if the
    // response status is 200 (OK).
    const response = await axios.post(`${API_BASE_URL}/surveyaccess/${accessKey}/authenticate`,
      null,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: validateStatusIsOKOnly
      });

    // NOTE: We expect the response to be OK since we have our own validateStatus
    //       in the request's Axios config.
    logger.debug(`Survey access response status was: ${response.status} - ${response.statusText}`);

    // TODO: Consider what exactly we want to log.
    const surveyAccess: SurveyAccess = (response.data as SurveyAccess);
    logger.debug(`Raw survey access mapping from the authentication axios post: ${JSON.stringify(surveyAccess, null, 2)}`);

    return surveyAccess;
  } catch (error) {
    logger.error(`Failed to get survey access mapping for access key '${accessKey}'`);
    logger.error(`Error from the axios get: ${error}`);
    if (error.response) {
      // The server returned a status that our validateStatus deems invalid.
      logger.error(`Survey access response status was: ${error.response.status} - ${error.response.statusText}`);
    }

    return null;
  }
}

/**
 * Fetches the survey from the server. This includes its metadata and submission
 * data (which may be initial data if the user hasn't submitted the survey yet).
 *
 * @async
 * @param surveyId The id of the survey we want to load.
 * @param accessToken The token we receive from authenticating the access key - this
 * token allows us to interact with the survey
 * @param logger The Vue logger instance (for outputting log messages)
 * @returns A promise resolving to the fetched survey (metadata and submission) or
 * null if the survey wasn't found (metadata and/or submission records missing).
 */
export const fetchSurveyAsync = async (surveyId: number, accessToken: string, logger: VueLogger): Promise<RawFetchedSurvey | null> => {
  // Mimic network latency in development mode (if that setting is configured).
  await devOptionallyAddExtraDelay('fetchSurveyAsync', 2000, logger);

  try {
    // Requests to get survey information require the access token and should
    // only succeed if the response status is OK (200).
    const authConfig: AxiosRequestConfig = {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      validateStatus: validateStatusIsOKOnly
    };

    // Fetch (get) the survey's metadata and submission data.
    const responses = await Promise.all([
      axios.get(`${API_BASE_URL}/surveymetadata/${surveyId}`, authConfig),
      axios.get(`${API_BASE_URL}/surveysubmissions/${surveyId}`, authConfig)
    ]);

    const responseForMetadata = responses[0];
    const responseForSubmission = responses[1];

    // NOTE: We expect the responses to be OK since we have our own validateStatus
    //       in the requests' Axios config.
    logger.debug(`Metadata response status was: ${responseForMetadata.status} - ${responseForMetadata.statusText}`);
    logger.debug(`Submission response status was: ${responseForSubmission.status} - ${responseForSubmission.statusText}`);

    const metadata: SurveyMetadata = (responseForMetadata.data as SurveyMetadata);
    logger.debug(`Survey metadata from the axios get: ${JSON.stringify(metadata, null, 2)}`);
    const submission: SurveySubmission = (responseForSubmission.data as SurveySubmission);
    logger.debug(`Survey submission from the axios get: ${JSON.stringify(submission, null, 2)}`);

    return {
      metadata,
      submission
    };
  } catch (error) {
    // Note that Promise.all would reject at the first rejection or error of any
    // of the promises inside of it.
    logger.error(`Failed to get metadata and/or submission for survey '${surveyId}'`);
    logger.error(`Error from the first failure from axios get: ${error}`);
    if (error.response) {
      // The server returned a status that our validateStatus deems invalid.
      logger.error(`Survey metadata or submission 'get' failure response status was: ${error.response.status} - ${error.response.statusText}`);
    }

    return null;
  }
}

/**
 * Sends updated survey responses to the server.
 *
 * @async
 * @param surveySubmission The updated survey responses to send to the server.
 * @param accessToken The token we receive from authenticating the access key
 * - this token allows us to interact with the survey
 * @param logger The Vue logger instance (for outputting log messages)
 * @returns A promise resolving true if the submission succeeded or resolving to
 * false if it failed.
 */
export const updateSurveySubmissionAsync = async (surveySubmission: SurveySubmission, accessToken: string, logger: VueLogger): Promise<SurveySubmitResult> => {
  const buildUnexpectedErrorResult = (): SurveySubmitResult => {
    return {
      wasAccepted: false,
      message: `The survey submission process failed unexpectedly.`,
      validationErrors: []
    };
  }

  // Mimic network latency in development mode (if that setting is configured).
  await devOptionallyAddExtraDelay('updateSurveySubmissionAsync', 2000, logger);

  logger.debug(`In updateSurveySubmissionAsync - updating survey submission with axios PUT...`);
  try {
    const response: AxiosResponse<any> = await axios.put(`${API_BASE_URL}/surveysubmissions/${surveySubmission.surveyId}`,
      surveySubmission,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        validateStatus: (status: number): boolean => {
          return (status === OK) || (status === NO_CONTENT);
        }
      });

    logger.debug(`Response from the axios put: ${JSON.stringify(response, null, 2)}`);
    logger.debug(`Response status was: ${response.status} - ${response.statusText}`);

    logger.info(`The survey was submitted successfully.`);
    return {
      wasAccepted: true,
      message: `Thank you for submitting the survey!`,
      validationErrors: []
    };
  } catch (error) {
    if (error.response) {
      const errorResponse: AxiosResponse<any> = error.response;
      switch (errorResponse.status) {
        case UNPROCESSABLE_ENTITY: {
          const validationErrors: Array<SurveyAnswerServerValidationError> = errorResponse.data.error as Array<SurveyAnswerServerValidationError>;
          logger.error(`The submitted survey had answer validation errors.`);
          return {
            wasAccepted: false,
            message: `Please fix these validation errors before submitting the survey.`,
            validationErrors
          };
        }

        case BAD_REQUEST: {
          // If the error response's data included an "error" object, then it
          // was a JSON validation error (invalid JSON request structure).
          // Otherwise, it could be an error where the wrong survey is being
          // submitted for the access token in question. Set the same result
          // message (which the user sees), but log the two cases separately.
          if (errorResponse.data.error == null) { // undefined or null
            logger.error(`Failed to validate the access token for the submitted survey.`);
          } else {
            logger.error(`The submitted survey may have included unexpected categories and/or questions.`);
            logger.error(`The server error message was: ${errorResponse.data.error as string}`);
          }

          return {
            wasAccepted: false,
            message: `The survey submission request had internal structural problems.`,
            validationErrors: []
          };
        }

        case INTERNAL_SERVER_ERROR: {
          logger.error(`The server ran into an unexpected error while processing the survey.`);
          logger.error(`The server error message was: ${errorResponse.data.error as string}`);
          return buildUnexpectedErrorResult();
        }

        default: {
          logger.error(`The API call to submit the survey failed with unexpected status ${errorResponse.status}`);
          return buildUnexpectedErrorResult();
        }
      }
    } else if (error.request) {
      // The request was made but no response was received - see the example in
      // https://github.com/axios/axios#handling-errors
      logger.error(`No response was received for the axios 'put' call to submit the survey: ${error}`);
      return buildUnexpectedErrorResult();
    } else {
      logger.error(`Got an unexpected error while trying to submit the survey (likely in axios 'put'): ${error}`);
      return buildUnexpectedErrorResult();
    }
  }
}
