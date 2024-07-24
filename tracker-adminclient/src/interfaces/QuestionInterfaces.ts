import { Entity, EntityAttributes } from "./Entity";

export interface QuestionAttributes extends EntityAttributes {
  id: number;
  categoryId: number;
  order: number;
  answerType: string;
  questionPrompt: string;
  options: string;
  validations: string;
  createdAt: Date | null,
  updatedAt: Date | null,
}


/** Question - structure for use in the Vue components */
export interface Question extends Entity<QuestionAttributes> {}
