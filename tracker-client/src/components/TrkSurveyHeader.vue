<template>
  <div class="survey-header">
    <h3>
      <strong>Hi {{ displayName }},</strong>
    </h3>
    <h4>
      Please fill out the questions for
      <span class="survey-date">{{ surveyDisplayDate }}</span>
    </h4>
  </div>
</template>

<script lang="ts">
import { useFormattingHelpers } from "../composables/formattingHelpers";
import { computed, defineComponent, Ref } from "vue";

export default defineComponent({
  name: "TrkSurveyHeader",
  props: {
    displayName: {
      type: String,
      required: true
    },
    surveyDate: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { formatRawDateStringForDisplay } = useFormattingHelpers();

    const surveyDisplayDate: Ref<string> = computed(() => {
      return formatRawDateStringForDisplay(props.surveyDate);
    });

    return {
      surveyDisplayDate
    };
  }
});
</script>

<style scoped>
.survey-header {
  margin-left: 1rem;
  margin-bottom: 2rem;
}
.survey-header h2 {
  margin-bottom: 0.2em;
}
.survey-header h3 {
  margin-top: 0;
}
.survey-header .survey-date {
  font-weight: bold;
  font-size: 0.9em;
}
</style>
