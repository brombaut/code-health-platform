<template>
  <header>
    <!-- TODO: Header -->
    <h1>Code Health</h1>
  </header>

  <main>
    <section id="left-pane" class="flex-row">
      <EnclosurePane
        ref="enclosurePane"
        :systemStructure="systemStructure"
        @enc-node-selected="handleEncNodeSelected"
        @enc-node-mouse-enter="handleEncNodeMouseEnter"
        @enc-node-mouse-leave="handleEncNodeMouseLeave"
      />
    </section>
    <section id="right-pane" class="flex-column">
      <InfoPane
        :selectedNode="selectedNode"
        :hoveringNode="hoveringNode"
        @info-node-selected="handleInfoNodeSelected"
        @info-node-mouse-enter="handleInfoNodeMouseEnter"
        @info-node-mouse-leave="handleInfoNodeMouseLeave"
      />
      <DependencyPane />
    </section>
  </main>
</template>


<script lang="ts">
import { defineComponent } from "vue";
import InfoPane from "./components/InfoPane/InfoPane.vue";
import EnclosurePane from "./components/EnclosurePane/EnclosurePane.vue";
import DependencyPane from "./components/DependencyPane/DependencyPane.vue";
import systemStructure from "@/assets/data/structure_and_dependencies.json";

export default defineComponent({
  name: "App",
  components: {
    EnclosurePane,
    InfoPane,
    DependencyPane,
  },
  data() {
    return {
      systemStructure,
      selectedNode: {},
      hoveringNode: null,
    };
  },
  methods: {
    handleEncNodeSelected(node) {
      this.selectedNode = node;
    },
    handleEncNodeMouseEnter(node) {
      /**
       * If hovering node is a descendent of the currently selected node, 
       * then set the child of the currently selected node that is also an 
       * ascenstor of the currently hovering node as the node to highlight in
       * the info pane as the hovering node (a node in the NodeDirectorySubModues will
       * be set as hovering).
       * 
       * Else the hovering node is the selected node itself or an ancestor of the selected node,
       * and we are good to just forward it along as the hovering node (a node in the SystemPath will
       * be set as hovering).
       */
      let temp = node;
      let useTemp = false;
      while (temp.parent) {
        if (temp.parent == this.selectedNode) {
          // First case
          useTemp = true;
          break;
        }
        temp = temp.parent;
      }
      this.hoveringNode = useTemp ? temp : node;
    },
    handleEncNodeMouseLeave(node) {
      // console.log(node);
      this.hoveringNode = null;
    },
    handleInfoNodeSelected(node) {
      this.$refs.enclosurePane.manuallySelectNode(node);
    },
    handleInfoNodeMouseEnter(node) {
      this.$refs.enclosurePane.manuallyHoverEnterNode(node);
    },
    handleInfoNodeMouseLeave(node) {
      this.$refs.enclosurePane.manuallyHoverLeaveNode(node);
    },
  },
});
</script>

<style lang="scss">
@import "./assets/base.css";

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;

  header {
    background-color: rgb(221, 221, 221);
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: row;

    #left-pane {
      flex: 3;
      display: flex;
    }

    #right-pane {
      flex: 2;
      background-color: rgb(251, 253, 255);
      border-left: 1px solid darkgray;
      padding: 4px 8px;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
