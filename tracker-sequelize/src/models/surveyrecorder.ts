/**
 * SurveyRecorder - Pseudo model for receiving and saving the survey submission request.
 */

import { sequelize } from "@shared/constants";
import logger from "@shared/Logger";
import { Category, Question, SurveyQuestion, SurveySection, Survey } from ".";
import { QuestionValidationError } from "@models/question";

/**
 * Interfaces used for parsing the JSON body
 */
interface QuestionJSON {
    questionId: number;
    answer: any;
}

interface CategoryJSON {
    tookPart: boolean;
    qstnSubmissions: Array<QuestionJSON>;
    categoryId: number;
}

interface SurveySubmissionJSON {
    surveyId: number;
    catSubmissions : Array<CategoryJSON>;
}

/******************************************
 * Exceptions and exception-related classes
 */

/**
 * Malformed JSON.
 */
export class JsonValidationError extends Error {
    constructor(message = "Invalid JSON request structure") {
        super(message);
    }
}

/**
 * Represents a validation error on a question.
 * This is a stand-in for Sequelize ValidationErrorItem (because this isn't a real Model).
 */
class SurveyValidationItem  {
    categoryId : number;
    questionId : number;
    validationName : string;
    message : string;

    constructor(
        categoryId : number,
        questionId : number,
        validationName : string,
        message = 'Invalid value')
    {
        this.categoryId = categoryId;
        this.questionId = questionId;
        this.validationName = validationName;
        this.message = message;
    }
}

/**
 * Collection of validation errors for the request.
 */
export class SurveyValidationError extends Error {
    errors: Array<SurveyValidationItem>;
    constructor(
        errors: Array<SurveyValidationItem>,
        message = "One or more answers failed validation"
    ) {
        super(message);
        this.errors = errors;
    }
}

/**
 * Represents an error saving the data.
 */
export class PersistError extends Error {
    constructor(message = "Internal Server Error") {
        super(message);
    }
}


/************************************
 * Pseudo model for receiving and saving the survey submission request.
 */
 export default class SurveyRecorder {
    // properties
    private submission : SurveySubmissionJSON;
    private catSectionMap: Array<number>;
    private categoryIds: Array<number>;
    public get surveyId(): number {
        return this.submission.surveyId;
    }

    constructor(requestBody: SurveySubmissionJSON) {
        this.submission = requestBody;
        this.catSectionMap = [];
        this.categoryIds = [];
    }

    /**
     * Set up internal data structures for validation and saving.
     */
    private async initValidation() {
        // Get sections in the current survey, as found in the db.
        const sections = await SurveySection.findAll({
            attributes: ['id', 'surveyId', 'categoryId'],
            include: [{
                model: Category,
                required: true, // INNER JOIN, so both SurveySection and Category must exist.
                attributes: ['id']
            }],
            where: {
                surveyId : this.surveyId
            }
        });

        // Make a reverse categoryId to sectionID mapping
        this.catSectionMap = sections.reduce<number[]>((accum, s) => {
            // logger.info(`s.categoryId: ${s.categoryId}, s.id: ${s.id}`);
            accum[s.categoryId] = s.id;
            return accum;
        }, new Array<number>());

        // Array of valid category Ids.
        this.categoryIds = sections.map((e : SurveySection) => {
            return e.categoryId
        });
    }

    /**
     * Validate survey submision JSON.
     *
     * @throws JsonValidationError, SurveyValidationError if validation fails.
     */
    private async validate() {
        await this.initValidation();
        this.validateSections();
        await this.validateAnswers();
        await this.changeStatus();
    }

    /**
     * Ensure survey sections are part of the survey.
     *  1. All surveysections must either
     *      a) exist as a record...
     *         which belongs to the survey (update case)
     *      OR
     *      TODO: b) have the same categoryId as a UserCategory
     *         where userId = current user. (create case)
     *
     * @throws JsonValidationError if validation fails.
     */
    private validateSections() {
        // 1.a) Survey section exists and belongs to the survey.
        if ( !(this.submission.catSubmissions).every(v => {
            return this.categoryIds.includes(v.categoryId)
        })) {
            logger.warn(
                // eslint-disable-next-line max-len
                `Validation failed: one or more submitted Survey Categories` +
                ` do not belong to survey ${this.surveyId}.\n` +
                `Category list: ${JSON.stringify(this.categoryIds)}`
            );
            throw new JsonValidationError;
        }
    }

    /**
     * Validate single survey answer based on question.validations.
     *
     * @param answer is the answer provided to the survey question.
     *              Note answer was parsed by JSON.parse().
     * @param question is the corresponding instance of Question.
     * @param qstRequest is the request data for the survey question.
     * @throws SurveyValidationItem if validation fails.
     */
    private validateOneAnswer(qstRequest : any, answer: any, question?: Question) {
        if (question == null) { //undefined or null
            // This might happen if a question is deleted.
            return;
        }

        try {
            // Accept the validated answer as the definitive answer.
            // RADAR: This mutates the request data.
            let stringAnswer : string;
            if (typeof answer === "string") {
                stringAnswer = answer.trim();
            } else {
                stringAnswer = JSON.stringify(answer);
            }
            const validatedAnswer = question.validateAnswer(stringAnswer);
            if (answer !== validatedAnswer) {
                // Log this because it could mean the client sent a value as the wrong type.
                logger.info(`Answer was transformed: ${JSON.stringify(answer)} `
                    + `=> ${JSON.stringify(validatedAnswer)}`);
            }
            // Replace the answer regardless, to ensure strings are trimmed.
            qstRequest.answer = validatedAnswer;

        } catch(e) {
            if (e instanceof(QuestionValidationError)) {
                // Transform the error
                logger.warn(`Validation failed.`);
                throw(new SurveyValidationItem(
                    question.categoryId, question.id, e.type, e.message
                ));
            }
            throw e;
        }
    }

    /**
     * Ensures the questions answered are part of the survey.
     * Also validates answers.
     *
     * @throws JsonValidationError if questions are not properly categorized.
     * @throws SurveyValidationError if any answers fail validation.
     */
    private async validateAnswers() {
        // 2. All answers must belong to a question...
        //    which belongs to one of the above surveysections.
        const surveyValidationItems = new Array<SurveyValidationItem>();

        const validQuestions = await Question.findAll({
            attributes: ['id', 'categoryId', 'answerType', 'options', 'validations'],
            where: {
                categoryId: this.categoryIds
            }
        });

        // Construct a valid question-category map.
        const questionMap = new Map<number, Question>();
        for (const q of validQuestions) {
            questionMap.set(q.id, q);
        }

        // Iterate through all questions and collect validation errors.
        for (const cat of this.submission.catSubmissions) {
            for (const qst of cat.qstnSubmissions) {
                if (questionMap.get(qst.questionId)?.categoryId !== cat.categoryId) {
                    logger.warn(
                        `Validation failed: Question ${qst.questionId}` +
                        ` does not belong to category ${cat.categoryId}.`);
                    throw new JsonValidationError;
                }

                try {
                    this.validateOneAnswer(qst, qst.answer, questionMap.get(qst.questionId));
                } catch(e){
                    if (e instanceof SurveyValidationItem) {
                        surveyValidationItems.push(e);
                    } else {
                        throw e;
                    }
                }
            }
        }
        if (surveyValidationItems.length > 0) {
            throw new SurveyValidationError(surveyValidationItems);
        }
    }

    /**
     * Persist survey submission to the database.
     *
     * @returns self.
     */
    async save() : Promise<SurveyRecorder> {
        await this.validate();

        // Iterate through all questions and save.
        try {
            await sequelize.transaction(async (t) => {

                for (const cat of this.submission.catSubmissions) {
                    // Save tookPart
                    // NOTE: Upsert relies on unique index: surveyId, categoryId
                    await SurveySection.upsert(
                        {
                            surveyId: this.surveyId,
                            categoryId: cat.categoryId,
                            tookPart: cat.tookPart
                        },
                        {
                            transaction: t
                        }
                    );

                    if (cat.tookPart) {
                        // Insert/Update all questions.
                        for (const qst of (cat.qstnSubmissions)) {
                            // NOTE: Upsert relies on unique index: surveyId, questionId
                            await SurveyQuestion.upsert(
                                {
                                    surveyId: this.surveyId,
                                    questionId: qst.questionId,
                                    answer: qst.answer,
                                    sectionId: this.catSectionMap[cat.categoryId]
                                },
                                {
                                    transaction: t
                                }
                            )
                        }
                    } else {
                        // Delete all questions in the category.
                        // NOTE: If sectionId doesn't exist then we don't need to delete questions.
                        if (this.catSectionMap[cat.categoryId]) {
                            await SurveyQuestion.destroy({
                                where: {
                                    surveyId: this.surveyId,
                                    sectionId: this.catSectionMap[cat.categoryId]
                                },
                                transaction: t
                            })
                        }
                    }
                }
            })
        } catch(error) {
            logger.err(error);
            logger.err(JSON.stringify(error));
            throw new PersistError;
        }

        return this;
    }


    /**
     * Change status of the survey submission.
     * @throws JsonValidationError if validation fails.
     */
    private async changeStatus() {
        // Find survey by surveyId and update status to 2
        const survey = await Survey.findByPk(this.surveyId);
        if (survey == null) {
            logger.warn(`Survey ${this.surveyId} not found.`);
            throw new JsonValidationError;
        }
        survey.status = 2;
        await survey.save();
        
    }

}
