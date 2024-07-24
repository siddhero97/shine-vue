import { Entity, EntityAttributes } from "./Entity";

/** Exact interface from sequelize */
export interface CategoryAttributes extends EntityAttributes {
  id: number;
  description: string;
  order: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/** Category - structure for use in the Vue components */
export interface Category extends Entity<CategoryAttributes> {}
