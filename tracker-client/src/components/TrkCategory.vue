<template>
  <ion-card class="survey-category">
    <ion-card-header class="survey-category-header">
      <ion-card-title
        >{{properties.description}}: <em>{{ tookPartDescription }}</em></ion-card-title
      >
      <ion-toggle v-model="localState.tookPart"></ion-toggle>
    </ion-card-header>
    <ion-card-content v-show="localState.tookPart" class="survey-category-questions">
      <ion-list>
        <trk-question
          v-for="question in nested"
          :key="question.properties.questionId"
          :properties="question.properties"
          v-model="question.state"
        ></trk-question>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script lang="ts">
import { useTypeConversionHelpers } from "../composables/typeConversionHelpers";
import { CategoryMetadata, CategoryUserResponse } from "../interfaces/CategoryInterfaces";
import { Question } from "../interfaces/QuestionInterfaces";
import TrkQuestion from "./TrkQuestion.vue";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonToggle,
} from "@ionic/vue";
import { computed, defineComponent, PropType, Ref } from "vue";
import { useLogger, VueLogger } from "vue-logger-plugin";

export default defineComponent({
  name: "TrkCategory",
  components: {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonToggle,
    TrkQuestion,
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
    modelValue: {
      type: Object as PropType<CategoryUserResponse>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, context) {
    const logger: VueLogger = useLogger();
    const { convertBooleanToYesNoString } = useTypeConversionHelpers();

    const localDebugLog = (message: string): void => {
      logger.debug(`TrkCategory - ${props.properties.description} (${props.properties.categoryId}) - ${message}`);
    }

    const localState: Ref<CategoryUserResponse> = computed({
      get: () => {
        localDebugLog(`localState.get: ${JSON.stringify(props.modelValue)}`);
        return props.modelValue;
      },
      set: (newValue) => {
        localDebugLog(`localState.set: newValue = ${JSON.stringify(newValue)}`);
        context.emit('update:modelValue', newValue);
      }
    });

    const tookPartDescription: Ref<string> = computed(() => {
      return convertBooleanToYesNoString(localState.value.tookPart);
    });

    return {
      localState,
      tookPartDescription
    };
  },
});
</script>

<style scoped>
.survey-category-header {
  /* TODO: These colors are for debugging for now!!! */
  background-color:var(--ion-color-light-tint);
}
</style>
