<template>
  <div id="enclosure-pane">
    <enclosure-diagram
      ref="enclosureDiagram"
      :treeData="systemStructure"
      @enc-node-selected="(n) => $emit('encNodeSelected', n)"
      @enc-node-mouse-enter="(n) => $emit('encNodeMouseEnter', n)"
      @enc-node-mouse-leave="(n) => $emit('encNodeMouseLeave', n)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EnclosureDiagram from "@/components/EnclosurePane/EnclosureDiagram.vue";

export default defineComponent({
  name: "EnclosurePane",
  props: {
    systemStructure: {
      type: Object,
      required: true,
    },
  },
  components: {
    EnclosureDiagram,
  },
  methods: {
    manuallySelectNode(node) {
      this.$refs.enclosureDiagram.onNodeClick(node);
    },
    manuallyHoverEnterNode(node) {
      this.$refs.enclosureDiagram.setHoveringNode(node);
    },
    manuallyHoverLeaveNode(node) {
      this.$refs.enclosureDiagram.removeHoveringNode(node);
    },
  },
});
</script>

<style lang="scss">
#enclosure-pane {
  // height: 300px;
  flex: 1;
  display: flex;
}
</style>