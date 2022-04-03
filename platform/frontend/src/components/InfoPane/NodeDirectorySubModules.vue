<template>
  <div id="node-directory-sub-modules">
    <ul id="module-children-ul">
      <li v-for="sDir in subDirectories" :key="sDir.data.name">
        <div
          :class="[
            'wrapper',
            {hovering: getNodesPath(sDir).join('-') === hoveringNodePath}
          ]"
          @click="$emit('infoNodeSelected', sDir)"
          @mouseenter="$emit('infoNodeMouseEnter', sDir)"
          @mouseleave="$emit('infoNodeMouseLeave', sDir)"
        >
          <img class="icon" src="@/assets/images/directory_icon.png" />
          <span
            :id="`node-sub-module-${makeNodeIdFromNode(sDir)}`"
            :class="[
              'node-sub-module',
              'directory',
            ]"
          >
            {{ sDir.data.name }}/
          </span>
        </div>
      </li>
      <li v-for="sFile in subFiles" :key="sFile.data.name">
        <div
          :class="[
            'wrapper',
            {hovering: getNodesPath(sFile).join('-') === hoveringNodePath}
          ]"
          @click="$emit('infoNodeSelected', sFile)"
          @mouseenter="$emit('infoNodeMouseEnter', sFile)"
          @mouseleave="$emit('infoNodeMouseLeave', sFile)"
        >
          <img class="icon" src="@/assets/images/file_icon.png" />
          <span
            :id="`node-sub-module-${makeNodeIdFromNode(sFile)}`"
            :class="[
              'node-sub-module',
              'file'
            ]"
          >
            {{ sFile.data.name }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NodeDirectorySubModules",
  props: {
    selectedDirectoryNode: {
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
    selectedDirectoryNodeSubModules() {
      if (Object.keys(this.selectedDirectoryNode).length === 0) return [];
      return this.selectedDirectoryNode.children.sort((a, b) => {
        // sort by name
        return a.data.name.localeCompare(b.data.name, "en", {
          sensitivity: "base",
        });
      });
    },
    subDirectories() {
      return this.selectedDirectoryNodeSubModules.filter((n) => n.children);
    },
    subFiles() {
      return this.selectedDirectoryNodeSubModules.filter((n) => !n.children);
    },
  },
  methods: {
    makeNodeIdFromNode(node) {
      const idPath = [];
      let temp = node;
      while (temp.parent) {
        idPath.unshift(CSS.escape(temp.data.name.replaceAll(".", "")));
        temp = temp.parent;
      }
      return idPath.join("-");
    },
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
#node-directory-sub-modules {
  overflow: auto;
  flex: 1;
  height: 100%;

  #module-children-ul {
    list-style: none;
    padding-left: 8px;

    li {
      margin: 4px 0;

      .wrapper {
        display: flex;
        flex-direction: row;

        .icon {
          height: 20px;
          width: 28px;
        }

        .node-sub-module {
          font-weight: bold;
          color: var(--selectable-color);
        }

        &:hover,
        &.hovering {
          cursor: pointer;

          .node-sub-module {
            color: var(--hover-color);
          }
        }
      }
    }
  }
}
</style>