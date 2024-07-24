<template>
  <ion-item>
    <ion-label position="floating">{{ properties.questionPrompt }}</ion-label>
    <ion-input type="text" v-model="localState.answer" debounce="100" inputmode="text"></ion-input>
  </ion-item>
</template>

<script lang="ts">
import { QuestionMetadata, QuestionUserResponse } from "../interfaces/QuestionInterfaces"
import { IonInput, IonItem, IonLabel } from "@ionic/vue";
import { computed, defineComponent, PropType, Ref } from "vue";
import { useLogger, VueLogger } from "vue-logger-plugin";

export default defineComponent({
  name: "TrkShorttextQuestion",
  components: {
    IonInput,
    IonItem,
    IonLabel
  },
  props: {
    properties: {
      type: Object as PropType<QuestionMetadata>,
      required: true
    },
    modelValue: {
      type: Object as PropType<QuestionUserResponse>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, context) {
    const logger: VueLogger = useLogger();

    const localDebugLog = (message: string): void => {
      logger.debug(`TrkShorttextQuestion - ${props.properties.questionPrompt} (${props.properties.questionId}) - ${message}`);
    }

    const localState: Ref<QuestionUserResponse> = computed({
      get: () => {
        localDebugLog(`localState.get: ${JSON.stringify(props.modelValue)}`);
        return props.modelValue;
      },
      set: (newValue) => {
        localDebugLog(`localState.set: newValue = ${JSON.stringify(newValue)}`);
        context.emit('update:modelValue', newValue);
      }
    });

    return {
      localState,
    };
  },
});
</script>

<style scoped></style>
