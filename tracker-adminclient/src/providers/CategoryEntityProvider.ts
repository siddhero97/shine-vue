import { CategoryAttributes } from '@/interfaces/CategoryInterfaces'
import {
  EntityProvider,
} from '@/providers/EntityProvider';

export default class CategoryEntityProvider extends EntityProvider<CategoryAttributes> {

  protected API_ENTITY_URL = `${EntityProvider.API_BASE_URL}/categories`;
  
}