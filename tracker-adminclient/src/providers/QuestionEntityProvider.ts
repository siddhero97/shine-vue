import { QuestionAttributes } from '@/interfaces/QuestionInterfaces'
import {
  EntityProvider,
} from '@/providers/EntityProvider';

export default class QuestionEntityProvider extends EntityProvider<QuestionAttributes> {

  protected API_ENTITY_URL = `${EntityProvider.API_BASE_URL}/questions`;
  
}