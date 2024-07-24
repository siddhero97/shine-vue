<template>
  <ion-card class="summary-category">
    <ion-card-header class="summary-category-header">
      <ion-card-title
        >{{properties.description}}: <span class="summary-took-part-answer">{{ tookPartDescription }}</span></ion-card-title
      >
    </ion-card-header>
    <ion-card-content v-show="state.tookPart" class="summary-category-questions">
      <ion-list>
        <trk-summary-question
          v-for="question in nested"
          :key="question.properties.questionId"
          :properties="question.properties"
          :state="question.state"
        ></trk-summary-question>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script lang="ts">
import { useTypeConversionHelpers } from "../composables/typeConversionHelpers";
import { CategoryMetadata, CategoryUserResponse } from "../interfaces/CategoryInterfaces";
import { Question } from "../interfaces/QuestionInterfaces";
import TrkSummaryQuestion from "./TrkSummaryQuestion.vue";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
} from "@ionic/vue";
import { computed, defineComponent, PropType, Ref } from "vue";
export default defineComponent({
  name: "TrkSummaryCategory",
  components: {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonList,
    TrkSummaryQuestion,
  },
  props: {
    properties: {
      type: Object as PropType<CategoryMetadata>,
      required: true
    },
    nested: {
      type: Array as PropType<Array<Question>>,
      required: true
    },
    state: {
      type: Object as PropType<CategoryUserResponse>,
      required: true
    }
  },
  setup(props) {
    const { convertBooleanToYesNoString } = useTypeConversionHelpers();

    const tookPartDescription: Ref<string> = computed(() => {
      return convertBooleanToYesNoString(props.state.tookPart as boolean);
    });

    return {
      tookPartDescription
    };
  },
});
</script>

<style scoped>
.summary-category-header {
  /* TODO: These colors are for debugging for now!!! */
  background-color: var(--ion-color-light-tint);
}
.summary-took-part-answer {
  color: var(--ion-color-primary);
  font-weight: bold;
}
</style>
