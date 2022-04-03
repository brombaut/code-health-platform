<template>
  <div id="node-file-information">
    <h3 id="node-file-information-header">File Metrics</h3>
    <table id="node-file-information-table">
      <tr v-for="a in attributes" :key="a.key">
        <td>
          <span class="label">{{ a.label }}</span>
        </td>
        <td>
          <span class="value">{{ attributeValue(a) }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NodeFileInformation",
  props: {
    selectedFileNode: {
      type: Object,
      required: true,
    },
  },
  data() {
    const attributes = [
      {
        key: "code_lines",
        label: "Code Lines",
        parser: (v) => v,
      },
      {
        key: "comment_lines",
        label: "Comment Lines",
        parser: (v) => v,
      },
      {
        key: "blank_lines",
        label: "Blank Lines",
        parser: (v) => v,
      },
      {
        key: "file_language",
        label: "Language",
        parser: (v) => v,
      },
      {
        key: "normalized_weight",
        label: "Hotspot Value",
        parser: (v) => v.toFixed(2),
      },
    ];
    return {
      attributes,
    };
  },
  methods: {
    attributeValue(a) {
      if (!this.selectedFileNode || !this.selectedFileNode.data) {
        return;
      }
      return a.parser(this.selectedFileNode.data[a.key]);
    },
  },
});
</script>

<style lang="scss">
#node-file-information {
  #node-file-information-table {
    td {
      padding: 4px 8px;
      font-size: 1em;

      .label {
        font-weight: bold;
      }
    }
  }
}
</style>