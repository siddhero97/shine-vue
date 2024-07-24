<template>
  <trk-page-base-layout class="home">
    <p><strong>{{ mainMessage }}</strong></p>
    <p>Please contact your System Administrator to get set up to receive {{ siteName }} surveys.</p>
  </trk-page-base-layout>
</template>

<script lang="ts">
import TrkPageBaseLayout from "../components/TrkPageBaseLayout.vue";
import { computed, defineComponent, Ref } from 'vue';

export default defineComponent({
  name: 'HomePage',
  components: {
    TrkPageBaseLayout
  },
  props: {
    isSurveyDone: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const mainMessage: Ref<string> = computed(() => {
      return props.isSurveyDone ?
        `Thanks for your submission!` :
        `Welcome!`;
    });

    return {
      mainMessage,
      siteName: process.env.VUE_APP_API_SITE_NAME,
    }
  },
});
</script>

<style scoped>
.home {
  text-align: center;
}

.home *:first-child {
  margin-top: 3rem;
}

.home p {
  font-size: 16px;
  line-height: 22px;
}

.home strong {
  font-size: 20px;
  line-height: 26px;
}
</style>
