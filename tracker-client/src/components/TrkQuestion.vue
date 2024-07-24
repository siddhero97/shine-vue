<template>
  <component
    :is="questionComponentName"
    :key="properties.questionId"
    :properties="properties"
    :modelValue="modelValue"
    @update:modelValue="onModelUpdate"></component>
</template>

<script lang="ts">
import TrkBooleanQuestion from "./TrkBooleanQuestion.vue";
import TrkMultiselectQuestion from "./TrkMultiselectQuestion.vue";
import TrkNumberQuestion from "./TrkNumberQuestion.vue";
import TrkSelectQuestion from "./TrkSelectQuestion.vue";
import TrkShorttextQuestion from "./TrkShorttextQuestion.vue";
import { QuestionMetadata, QuestionUserResponse } from "../interfaces/QuestionInterfaces"
import { computed, defineComponent, PropType, Ref } from "vue";

export default defineComponent({
  name: "TrkQuestion",
  components: {
    TrkBooleanQuestion,
    TrkMultiselectQuestion,
    TrkNumberQuestion,
    TrkSelectQuestion,
    TrkShorttextQuestion
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
    const answerTypeToComponentNameMap: Record<string, string> = {
      boolean: TrkBooleanQuestion.name,
      multiselect: TrkMultiselectQuestion.name,
      number: TrkNumberQuestion.name,
      select: TrkSelectQuestion.name,
      shorttext: TrkShorttextQuestion.name
    }

    const questionComponentName: Ref<string> = computed(() => {
       return answerTypeToComponentNameMap[props.properties.answerType] ?? TrkShorttextQuestion.name;
    })

    const onModelUpdate = (newModelValue: QuestionUserResponse): void => {
      context.emit('update:modelValue', newModelValue );
    }

    return {
      onModelUpdate,
      questionComponentName
    };

  },
});
</script>

<style scoped></style>
