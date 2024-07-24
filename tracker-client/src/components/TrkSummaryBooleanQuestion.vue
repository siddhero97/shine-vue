<template>
  <p class="summary-question"><span class="summary-question-prompt">{{ properties.questionPrompt }}:</span> <span class="summary-question-answer">{{ yesNoDescription }}</span></p>
</template>

<script lang="ts">
import { useTypeConversionHelpers } from "../composables/typeConversionHelpers";
import { QuestionMetadata, QuestionUserResponse } from "../interfaces/QuestionInterfaces"
import { computed, defineComponent, PropType, Ref } from "vue";

export default defineComponent({
  name: "TrkSummaryBooleanQuestion",
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
    const { convertBooleanToYesNoString } = useTypeConversionHelpers();

    const yesNoDescription: Ref<string> = computed(()  => {
      return convertBooleanToYesNoString(props.state.answer as boolean);
    });

    return {
      yesNoDescription,
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
