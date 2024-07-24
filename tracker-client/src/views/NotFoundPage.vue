<template>
  <trk-page-base-layout class="notfound">
    <p><strong>We can't find what you're looking for.</strong></p>
    <p>Go back to the <a href="/">homepage</a>.</p>
  </trk-page-base-layout>
</template>

<script lang="ts">
import TrkPageBaseLayout from "../components/TrkPageBaseLayout.vue";
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NotFoundPage',
  components: {
    TrkPageBaseLayout
  },
});
</script>

<style scoped>
.notfound {
  text-align: center;
}

.notfound *:first-child {
  margin-top: 3rem;
}

.notfound p {
  font-size: 16px;
  line-height: 22px;
}

.notfound strong {
  font-size: 20px;
  line-height: 26px;
}

.notfound a {
  font-weight: bold;
  text-decoration: none;
}
</style>
