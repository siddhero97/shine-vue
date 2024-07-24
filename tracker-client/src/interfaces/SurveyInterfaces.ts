import { Category, CategoryMetadata, CategorySubmission } from './CategoryInterfaces'

/** Unique key for the survey (not its access key) */
export interface SurveyKey {
  surveyId: number;
}

/** Access to the survey, which maps an access token to a survey ID - upon
 * authentication of an access key, you get an access token and a survey ID
 */
export interface SurveyAccess
  extends SurveyKey {
  accessToken: string;
}

/** What gets submitted back to the server for the survey (including its categories) */
export interface SurveySubmission
  extends SurveyKey {
  catSubmissions: Array<CategorySubmission>;
}

/**
 * Represents an individual server-side validation error for a survey answer.
 *
 * This is based on the SurveyValidationItem class in the tracker-sequelize's
 * surveyrecorder.ts
 */
export interface SurveyAnswerServerValidationError {
  /**
   * The ID of the category whose question has this validation error
   */
  categoryId: number;

  /**
   * The ID of the question that this validation error applies to.
   */
  questionId: number;

  /**
   * The type of validation that failed.
   */
  validationName: string;

  /**
   * The validation error message (does not include category/question name)
   */
  message : string;
}

/** A processed result of the server's response to submitting the survey. The
 * survey provider processes the server's response into a form that the Vue
 * composables and components can use.
*/
export interface SurveySubmitResult {
  /**
   * Indicates whether or not the server accepted the survey submission.
   */
  wasAccepted: boolean;

  /**
   * Result message (either a success message or an error). Note that there is
   * still a main message even if there are also validation errors.
   */
  message: string;

  /**
   * Array of server-side validation errors for survey answers. This array is
   * non-empty if the survey was rejected due to such errors.
   */
  validationErrors: Array<SurveyAnswerServerValidationError>;
}

/** Read-only metadata (props) for the survey (including its questions) */
export interface SurveyMetadata
  extends SurveyKey {
  /** The display name of the user that this survey is for (e.g. Melanie) */
  displayName: string;

  /** The date the survey applies to (e.g. "December 31, 2019"). Note that this
   * is probably earlier than the date the user fills in and submits the survey.
   */
  surveyDate: string;

  /**
   * The date this survey was first opened (e.g. "January 2, 2020"). If the survey
   * has not yet been opened, this date is empty.
   */
  startDate?: string;

  /**
   * The date this survey was first submitted to the server (e.g. "January 3, 2020").
   * If the survey has not yet been submitted, this date is empty.
   */
  submitDate?: string;

  /**
   * The survey's current status (as determined by the server)
   */
  status: "created" | "opened" | "submitted" | "finalized"

  /** The list of read-only metadata (props) for categories belonging to this
   *  survey */
  catMetaList: Array<CategoryMetadata>;
}

/** Survey - structure for use in the Vue components */
export interface Survey {
  properties: SurveyMetadata,
  nested: Array<Category>
}

