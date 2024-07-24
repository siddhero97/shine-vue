<template>
  <ion-item>
    <ion-label position="floating">{{ properties.questionPrompt }}</ion-label>
    <ion-select v-model="localState.answer" multiple="true">
      <ion-select-option
        v-for="(option, index) in properties.options"
        :key="index"
        :value="option[0]"
      >{{option[1]}}</ion-select-option>
    </ion-select>
  </ion-item>
</template>

<script lang="ts">
import { QuestionMetadata, QuestionUserResponse } from "../interfaces/QuestionInterfaces"
import { IonItem, IonLabel, IonSelect, IonSelectOption } from "@ionic/vue";
import { computed, defineComponent, PropType, Ref } from "vue";
import { useLogger, VueLogger } from "vue-logger-plugin";

export default defineComponent({
  name: "TrkMultiselectQuestion",
  components: {
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
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
      logger.debug(`TrkMultiselectQuestion - ${props.properties.questionPrompt} (${props.properties.questionId}) - ${message}`);
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
