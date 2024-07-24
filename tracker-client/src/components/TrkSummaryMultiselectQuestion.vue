<template>
  <p class="summary-question"><span class="summary-question-prompt">{{ properties.questionPrompt }}:</span> <span class="summary-question-answer">{{ selectionDisplays }}</span></p>
</template>

<script lang="ts">
import { QuestionMetadata, QuestionUserResponse } from "../interfaces/QuestionInterfaces"
import { computed, defineComponent, PropType, Ref } from "vue";
import { useLogger, VueLogger } from "vue-logger-plugin";

export default defineComponent({
  name: "TrkSummaryMultiselectQuestion",
  props: {
    properties: {
      type: Object as PropType<QuestionMetadata>,
      required: true
    },
    state: {
      type: Object as PropType<QuestionUserResponse>,
      required: true
    },
  },
  setup(props) {
    const logger: VueLogger = useLogger();

    const getDisplaysOfSelected = (options: Array<[number, string]>, selectedValues: Array<number>): string => {
      const selectedDisplayStrings: Array<string> = [];

      selectedValues.forEach(selectedValue => {
        const matchingOption: [number, string]|undefined = options.find(option => {
          return option[0] === selectedValue;
        });

        if (typeof matchingOption !== "undefined") {
          selectedDisplayStrings.push(matchingOption[1]);
        } else {
          logger.warn(`No matching option for underlying selected value ${selectedValue}`);
        }
      });

      return selectedDisplayStrings.join(", ");
    }

    const selectionDisplays: Ref<string> = computed(() => {
      return getDisplaysOfSelected(props.properties.options ?? [], props.state.answer ?? []);
    });

    return {
      selectionDisplays,
    }
  },
});
</script>

<style scoped>
.summary-question {
  font-size: 1.1rem;
}
.summary-question-prompt {
  color: var(--ion-color-dark);
}
.summary-question-answer {
  color: var(--ion-color-primary);
  font-weight: bold;
}
</style>
