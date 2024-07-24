/** Unique key for the question */
export interface QuestionKey {
  questionId: number;
}

/** User-supplied data (mutable state) for the question */
export interface QuestionUserResponse {
  /** The user's answer to the survey question */
  answer: any;
}

/** What gets submitted back to the server for the question */
export interface QuestionSubmission
  extends QuestionKey, QuestionUserResponse {
}

/** Read-only metadata (props) for the question */
// NOTE: Due to the design of the server for the metadata side of things, the
//       data structure requires us to wrap the default answer in a
//       QuestionUserResponse object.
export interface QuestionMetadata
  extends QuestionKey {
  /** The data type of the answer */
  answerType: "boolean" | "longtext" | "multiselect" | "number" | "select" | "shorttext";

  /** The prompt (wording) for the question - the survey shows this to the user */
  questionPrompt: string;

  /** (Optional) The list of possible values and associated display strings in the
   * case of a "multiselect" or "select" type of question.
   */
  options?: Array<[number, string]>;

  /** The default user response for the question. The user response is reset to
   * this value if the user chooses to "clear all" for the survey.
  */
  defaultUserResponse: QuestionUserResponse;

  /** (Optional) Validation constraints for the question */
  validations?: any;
}

/** Question - structure for use in the Vue components */
export interface Question {
  properties: QuestionMetadata,
  state: QuestionUserResponse
}
