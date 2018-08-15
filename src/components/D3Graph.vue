<template>
<div>

  <d3-network :net-nodes="nodes" :net-links="links" :options="options" :link-cb="lcb" />

  <arrow-head/>

</div>
</template>

<script>
import D3Network from "vue-d3-network";
import ArrowHead from "./ArrowHead.vue";

export default {
  name: "D3Graph",
  components: {
    D3Network,
    ArrowHead
  },
  props: ["nodes", "links"],
  data() {
    return {
      options: {
        force: 3000,
        nodeSize: 20,
        linkWidth: 2,
        nodeLabels: true
      }
    };
  },
  methods: {
    lcb(link) {
      link._svgAttrs = {
        "marker-end": "url(#m-end)"
      };
      return link;
    }
  }
};
</script>

<style scoped>
.node-label {
  font-size: 1rem;
}
</style>
