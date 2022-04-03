<template>
  <div id="info-pane">
    <div id="system-path-container">
      <SystemPath
        :selectedNode="selectedNode"
        :hoveringNode="hoveringNode"
        @info-node-selected="(n) => $emit('infoNodeSelected', n)"
        @info-node-mouse-enter="(n) => $emit('infoNodeMouseEnter', n)"
        @info-node-mouse-leave="(n) => $emit('infoNodeMouseLeave', n)"
      />
      <hr />
    </div>
    <div id="selected-node-details">
      <div id="directory-node-details" v-if="selectedNode.children">
        <NodeDirectoryInformation :selectedDirectoryNode="selectedNode" />
        <div class="vertial-rule"></div>
        <NodeDirectorySubModules
          :selectedDirectoryNode="selectedNode"
          :hoveringNode="hoveringNode"
          @info-node-selected="(n) => $emit('infoNodeSelected', n)"
          @info-node-mouse-enter="(n) => $emit('infoNodeMouseEnter', n)"
          @info-node-mouse-leave="(n) => $emit('infoNodeMouseLeave', n)"
        />
      </div>
      <NodeFileInformation v-else />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SystemPath from "./SystemPath.vue";
import NodeDirectoryInformation from "./NodeDirectoryInformation.vue";
import NodeDirectorySubModules from "./NodeDirectorySubModules.vue";
import NodeFileInformation from "./NodeFileInformation.vue";

export default defineComponent({
  name: "InfoPane",
  props: {
    selectedNode: {
      type: Object,
      required: true,
    },
    hoveringNode: {
      type: Object,
      required: false,
    },
  },
  components: {
    SystemPath,
    NodeDirectoryInformation,
    NodeDirectorySubModules,
    NodeFileInformation,
  },
  emits: ["infoNodeSelected", "infoNodeMouseEnter", "infoNodeMouseLeave"],
});
</script>

<style lang="scss">
#info-pane {
  height: 300px;
  display: flex;
  flex-direction: column;

  #selected-node-details {
    flex: 1;
    height: 90%;

    #directory-node-details {
      display: flex;
      flex-direction: row;
      height: 100%;

      .vertial-rule {
        height: 100%;
        border-left: 2px solid gray;
      }
    }
  }
}
</style>