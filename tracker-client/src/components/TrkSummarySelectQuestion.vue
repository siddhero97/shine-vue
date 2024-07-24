<template>
  <p class="summary-question"><span class="summary-question-prompt">{{ properties.questionPrompt }}:</span> <span class="summary-question-answer">{{ selectionDisplay }}</span></p>
</template>

<script lang="ts">
import { QuestionMetadata, QuestionUserResponse } from "../interfaces/QuestionInterfaces"
import { computed, defineComponent, PropType, Ref } from "vue";

export default defineComponent({
  name: "TrkSummarySelectQuestion",
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
    const getDisplayOfSelected = (options: Array<[number, string]>, selectedValue: number): string => {
      const selectedOption: [number, string]|undefined = options.find(option => {
        return option[0] === selectedValue;
      });

      return selectedOption?.[1] ?? ""; // default to empty display string if value doesn't match any of the options' values
    }

    const selectionDisplay: Ref<string> = computed(() => {
      return getDisplayOfSelected(props.properties.options ?? [], props.state.answer);
    });

    return {
      selectionDisplay,
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
