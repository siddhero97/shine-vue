<template>
  <p class="summary-question"><span class="summary-question-prompt">{{ properties.questionPrompt }}:</span> <span class="summary-question-answer">{{ state.answer }}</span></p>
</template>

<script lang="ts">
import { QuestionMetadata, QuestionUserResponse } from "../interfaces/QuestionInterfaces"
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "TrkSummaryShorttextQuestion",
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
