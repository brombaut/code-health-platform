<template>
  <div id="enclosure-pane">
      <enclosure-diagram
        :treeData="systemStructure"
        :eventCallbacks="eventCallbacks" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { SystemStructureNode } from "@/types"
import EnclosureDiagram from "@/components/EnclosureDiagram.vue";

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
    },
    data() {
        const eventCallbacks = {
            onClick: (event, d) => this.onNodeClick(d),
            onMouseEnter: (event, d) => {
                this.onNodeHover(d, true);
                this.tooltip.show(d, event.target);
            },
            onMouseLeave: (event, d) => {
                this.onNodeHover(d, false);
                this.tooltip.hide();
            },
        };
        return {
            eventCallbacks,
        };
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