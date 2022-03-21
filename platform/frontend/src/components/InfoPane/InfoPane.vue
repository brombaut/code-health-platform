<template>
  <div id="info-pane">
      <div id="system-path-container">
        <SystemPath :selectedNode="selectedNode" />
        <hr>
        <div id="selected-node-details">
            <NodeDirectoryInformation
                v-if="selectedNode.children"
                :selectedDirectoryNode="selectedNode"/>
            <NodeFileInformation v-else />
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SystemPath from "./SystemPath.vue";
import NodeDirectoryInformation from "./NodeDirectoryInformation.vue";
import NodeFileInformation from "./NodeFileInformation.vue";


export default defineComponent({
    name: "InfoPane",
    props: {
        selectedNode: {
            type: Object,
            required: true,
        }
    },
    components: {
        SystemPath,
        NodeDirectoryInformation,
        NodeFileInformation
    },
});
</script>

<style lang="scss">
#info-pane {
    height: 300px;
}
</style>