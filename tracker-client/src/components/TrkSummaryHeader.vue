<template>
  <div class="summary-header">
    <h2>
      <strong>Thanks {{ displayName }}!</strong>
    </h2>
    <h3>
      Here's a summary of your responses&nbsp;for<br/>
      <span class="summary-date">{{ surveyDisplayDate }}.</span>
    </h3>
  </div>
</template>

<script lang="ts">
import { useFormattingHelpers } from "../composables/formattingHelpers";
import { computed, defineComponent, Ref } from "vue";

export default defineComponent({
  name: "TrkSummaryHeader",
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
.summary-header {
  margin-left: 1rem;
  margin-bottom: 2rem;
}
.summary-header h2 {
  margin-bottom: 0.2em;
}
.summary-header h3 {
  margin-top: 0;
}
.summary-header .summary-date {
  font-weight: bold;
  font-size: 0.9em;
}
</style>
