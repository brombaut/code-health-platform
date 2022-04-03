<template>
  <div id="system-path">
    <!-- TODO: This conditional class doesn't work on first load -- don't know why -->
    <span
      id="prefix-label"
      :class="{
        selectable: selectedNode?.parent,
        selected: !selectedNode?.parent,
        hovering: hoveringNodePath === 'root'
      }"
      @click="$emit('infoNodeSelected', null)"
      @mouseenter="$emit('infoNodeMouseEnter', null)"
      @mouseleave="$emit('infoNodeMouseLeave', null)"
    >
      System
    </span>
    <span class="system-component-separator">/</span>
    <span v-for="(node, idx) of nodePathToRoot" :key="node.data.name">
      <span
        :class="[
          'system-component',
          {selected: idx === nodePathToRoot.length - 1},
          {selectable: idx !== nodePathToRoot.length - 1},
          {hovering: getNodesPath(node).join('-') === hoveringNodePath}
        ]"
        @click="$emit('infoNodeSelected', node)"
        @mouseenter="$emit('infoNodeMouseEnter', node)"
        @mouseleave="$emit('infoNodeMouseLeave', node)"
      >
        {{ node.data.name }}
      </span>
      <span
        v-if="idx < nodePathToRoot.length - 1"
        class="system-component-separator"
        >&sol;</span
      >
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SystemPath",
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
  data() {
    return {
      hoveringNodePath: null,
    };
  },
  emits: ["infoNodeSelected", "infoNodeMouseEnter", "infoNodeMouseLeave"],
  computed: {
    nodePathToRoot() {
      if (Object.keys(this.selectedNode).length === 0) {
        return [];
      }
      const currPath = [];
      let temp = this.selectedNode;
      while (temp.parent) {
        currPath.unshift(temp);
        temp = temp.parent;
      }
      return currPath;
    },
  },
  methods: {
    setHoveringNodePath() {
      this.hoveringNodePath = this.getNodesPath(this.hoveringNode).join("-");
    },
    getNodesPath(node) {
      if (!node || Object.keys(node).length === 0) {
        return []
      }
      const path = [];
      let temp = node;
      while (temp) {
        path.unshift(temp.data.name);
        temp = temp.parent;
      }
      return path;
    },
  },
  watch: {
    hoveringNode() {
      this.setHoveringNodePath();
    },
  },
  mounted() {
    this.setHoveringNodePath();
  },
});
</script>

<style lang="scss">
#system-path {
  #prefix-label,
  .system-component-separator,
  .system-component {
    margin: 0px 2px;
    font-weight: bold;
    color: rgb(83, 83, 83);
  }

  #prefix-label.selectable,
  .system-component.selectable {
    color: var(--selectable-color);

    &:hover,
    &.hovering {
      cursor: pointer;
      color: var(--hover-color);
    }
  }

  #prefix-label.selected,
  .system-component.selected {
    color: var(--selected-color);
  }
}
</style>