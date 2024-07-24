<template>
  <component
    :is="summaryQuestionComponentName"
    :key="properties.questionId"
    :properties="properties"
    :state="state"></component>
</template>

<script lang="ts">
import TrkSummaryBooleanQuestion from "./TrkSummaryBooleanQuestion.vue";
import TrkSummaryMultiselectQuestion from "./TrkSummaryMultiselectQuestion.vue";
import TrkSummarySelectQuestion from "./TrkSummarySelectQuestion.vue";
import TrkSummaryShorttextQuestion from "./TrkSummaryShorttextQuestion.vue";
import { QuestionMetadata, QuestionUserResponse } from "../interfaces/QuestionInterfaces"
import { computed, defineComponent, PropType, Ref } from "vue";

export default defineComponent({
  name: "TrkSummaryQuestion",
  components: {
    TrkSummaryBooleanQuestion,
    TrkSummaryMultiselectQuestion,
    TrkSummarySelectQuestion,
    TrkSummaryShorttextQuestion,
  },
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
    const answerTypeToComponentNameMap: Record<string, string> = {
      boolean: TrkSummaryBooleanQuestion.name,
      multiselect: TrkSummaryMultiselectQuestion.name,
      number: TrkSummaryShorttextQuestion.name, // Can use the same component as for short text
      select: TrkSummarySelectQuestion.name,
      shorttext: TrkSummaryShorttextQuestion.name
    }

    const summaryQuestionComponentName: Ref<string> = computed(() => {
       return answerTypeToComponentNameMap[props.properties.answerType] ?? TrkSummaryShorttextQuestion.name;
    })

    return {
      summaryQuestionComponentName
    };

  },
});
</script>

<style scoped></style>
