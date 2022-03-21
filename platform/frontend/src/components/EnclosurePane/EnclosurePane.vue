<template>
  <div id="enclosure-pane">
      <enclosure-diagram
        :treeData="systemStructure"
        @enc-node-selected="(n) => $emit('encNodeSelected', n)"
        @enc-node-mouse-enter="(n) => $emit('encNodeMouseEnter', n)"
        @enc-node-mouse-leave="(n) => $emit('encNodeMouseLeave', n)"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { SystemStructureNode } from "@/types"
import EnclosureDiagram from "@/components/EnclosurePane/EnclosureDiagram.vue";

export default defineComponent({
    name: "EnclosurePane",
    props: {
        systemStructure: {
            type: Object as () => SystemStructureNode,
            required: true,
        }
    },
    components: {
        EnclosureDiagram,
    }
});
</script>

<style lang="scss">
#enclosure-pane {
    // height: 300px;
    flex: 1;
    display: flex;
}
</style>