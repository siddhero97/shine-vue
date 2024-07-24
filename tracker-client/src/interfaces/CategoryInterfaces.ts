import { Question, QuestionMetadata, QuestionSubmission } from './QuestionInterfaces'

/** Unique key for the category */
export interface CategoryKey {
  categoryId: number;
}

/** User-supplied data (mutable state) for the category */
export interface CategoryUserResponse {
  /** Indicates whether or not the user was involved in that category for the given survey */
  tookPart: boolean;
}

/** What gets submitted back to the server for the category (including its questions) */
export interface CategorySubmission
  extends CategoryKey, CategoryUserResponse {
  qstnSubmissions: Array<QuestionSubmission>;
}

/** Read-only metadata (props) for the category (including its questions) */
// NOTE: Due to the design of the server for the metadata side of things, the
//       data structure requires us to wrap the default "tookPart" flag in a
//       CategoryUserResponse object.
export interface CategoryMetadata
  extends CategoryKey {
  /** The category's descriptive name (e.g. Art Program - East Van) */
  description: string;

  /** The default user response for the category. The user response is reset to
   * this value if the user chooses to "clear all" for the survey.
  */
  defaultUserResponse: CategoryUserResponse;

  /** The list of read-only metadata (props) for questions belonging to this
   *  category */
  qstnMetaList: Array<QuestionMetadata>;
}

/** Category - structure for use in the Vue components */
export interface Category {
  properties: CategoryMetadata,
  state: CategoryUserResponse,
  nested: Array<Question>
}
