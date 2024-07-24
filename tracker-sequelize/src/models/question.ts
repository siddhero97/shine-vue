import { Model, DataTypes } from "sequelize";
import { sequelize } from "@shared/constants"
import EntityAttributes from "@interfaces/EntityAttributes";
import validator from "validator";
import logger from "@shared/Logger";

/**
 * Class modelled after Sequelize ValidationErrorItem, except we can't use ValidationErrorItem
 * because it eats values.
 */
export class QuestionValidationError {
  /** An error message */
  public readonly  message: string;

  /** The type of the validation error */
  public readonly  type: string;

  /** The value that generated the error */
  public readonly  value: string;

  constructor(message: string, type: string, value: string) {
      this.message = message;
      this.type = type;
      this.value = value;
  }
}

/** A simple validation function takes one parameter and returns true if valid or false if not. */
type SimpleValidation = { (str: string) : boolean };

// NOTE: The message can be used for logging, but for security reasons
// we will not use them on the client.
export const validatorWhitelist : { [index:string] : {func: SimpleValidation, message: string} } =
{
    'alpha': {func: validator.isAlpha, message: 'Value is not alphabetic'},
    'alphanumeric': {func: validator.isAlphanumeric, message: 'Value is not alphanumeric'},
    'decimal': {func: validator.isDecimal, message: 'Value is not a valid number'},
    'email': {func: validator.isEmail, message: 'Value is not a valid email address'},
    'float': {func: validator.isFloat, message: 'Value is not a valid number'},
    'int': {func: validator.isInt, message: 'Value is not an integer'},
    'numeric': {func: validator.isNumeric, message: 'Value is not numeric'},
    'required': {func: isNotEmpty, message: 'Value is required'},
    'positive': {func: isPositive, message: 'Value must be greater than zero'},
    'non-negative': {func: isNonNegative, message: 'Value must be zero or greater'},
};

// Return true if not null/undefined and not empty.
function isNotEmpty(str?: string) {
    return !(str === '' || str == null);
}

// Return true if value is a positive number
function isPositive(str: string) {
    return validator.toFloat(str) > 0.0;
}

// Return true if value is zero or a positive number
function isNonNegative(str: string) {
    return validator.toFloat(str) >= 0.0;
}

export interface QuestionAttributes extends EntityAttributes {
    id: number;
    categoryId: number;
    order: number;
    answerType: string;
    questionPrompt: string;
    options: string;
    validations: string;
}

export const QuestionColumns = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    answerType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    questionPrompt: {
        type: DataTypes.STRING,
        allowNull: false
    },
    options: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    validations: {
        type: DataTypes.STRING,
        //type: DataTypes.JSON,
        allowNull: true
    }
};

//type QuestionCreationAttributes = Optional<QuestionAttributes, "id">;
// interface QuestionCreationAttributes
//     extends Optional<QuestionAttributes, "id"> {}

export default class Question extends Model //<QuestionAttributes, QuestionCreationAttributes>
implements QuestionAttributes {
public id!: number;
public categoryId!: number;
public order!: number;
public answerType!: string;
public questionPrompt!: string;
public options!: string;
public validations!: string;

public readonly createdAt!: Date;
public readonly updatedAt!: Date;

/**
 * Return validated answer if valid, or throw an error if invalid.
 * @param answer string value to validate
 * @returns validated answer of the correct type
 * @throws QuestionValidationError, Error
  */
public validateAnswer(answer: string) : any {
    const validatedAnswer = this.validateAnswerByType(answer);
    this.validateAnswerByExtraField(answer);
    return validatedAnswer;
}

/**
 * Validate answer according to the answerType member.
 * @param answer string value to validate
 * @returns value formatted as the correct type.
 * @throws QuestionValidationError, Error
 */
private validateAnswerByType(answer: string): number | boolean | string | (string | number)[] {
    const options: unknown = this.options;

    switch(this.answerType) {
        case "number":
            if (validator.isFloat(answer)) {
                return validator.toFloat(answer);
            }
            throw(new QuestionValidationError(
                "Value is not a number",
                this.answerType,
                answer
            ));

        case "boolean":
            if (validator.isBoolean(answer)) {
                return validator.toBoolean(answer, true);
            }
            throw(new QuestionValidationError(
                "Value is not a boolean",
                this.answerType,
                answer
            ));

        case "longtext":
            return answer;

        case "shorttext":
            return answer;

        case "select":
            {
                if ( !(options instanceof(Array)) ) {
                    logger.err('Invalid question options');
                    throw(Error('Invalid question options'));
                }

                // The selection should be the value of one of the question options.
                const optionValues: number[] = options.map((opt: [number, string]) => opt[0]);
                if (optionValues.includes(JSON.parse(answer))) {
                    return answer;
                }

                throw(new QuestionValidationError(
                    "Value is not a valid option for this question",
                    this.answerType,
                    answer
                ));
            }

        case "multiselect":
            {
                if ( !(options instanceof(Array)) ) {
                    logger.err(`Invalid question options in question ${this.id}`);
                    throw(Error('Invalid question options'));
                }

                const answerList : number[] = JSON.parse(answer);
                if ( !(answerList instanceof(Array)) ) {
                    logger.err('Multiselect answer is not an array');
                    throw(Error('Multiselect answer is not an array'));
                }
                const optionValues: number[] = options.map((opt: [number, string]) => opt[0]);
                if (answerList.every((a : number)=>(optionValues.includes(a)))) {
                    return answerList;
                }
                throw(new QuestionValidationError(
                    "Value has one or more invalid options for this question",
                    this.answerType,
                    answer
                ));
            }

        default:
            logger.err(`Invalid answer type in question ${this.id}`);
            throw(Error('Invalid answer type'));
    }
}

/**
 * Validate answer according to the validations member.
 * @param answer
 * @returns null
 * @throws ValidationErrorItem
 */
private validateAnswerByExtraField(answer: string) {
    // See https://github.com/validatorjs/validator.js for list of validations

    if (this.validations == null) { //undefined or null
        return;
    }

    const validations = this.validations?.split(' ') || [];

    validations.forEach((validatorKey) => {
        // Call the named validator if it's in the whitelist.
        const v = validatorWhitelist[validatorKey];
        const isValid : boolean | null = v?.func(answer);

        if (isValid === true) {
            return;
        }

        if (isValid === false) {
            throw new QuestionValidationError(
                v.message,
                validatorKey,
                answer
            );
        }

        // isValid is null, i.e. the validator is not in the whitelist.
        logger.err('Unknown validator in question.validators');
        throw new QuestionValidationError(
            "Unknown validator",
            validatorKey,
            answer
        );
    });
}

}
Question.init(QuestionColumns, {
    modelName: 'Question',
    sequelize
});
