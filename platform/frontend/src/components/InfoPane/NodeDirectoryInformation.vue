<template>
  <div id="node-directory-information">

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "NodeDirectoryInformation",
    props: {
        selectedDirectoryNode: {
            type: Object,
            required: true,
        }
    },
    mounted() {
        this.updateEl();
    },
    watch: {
        selectedDirectoryNode(newNode) {
            this.updateEl();
        },
    },
    methods: {
        updateEl() {
            const el = this.$el;
            el.innerHTML = "";
            el.appendChild(this.makeNodeDirectoryInformation(this.selectedDirectoryNode));
        },
        makeNodeDirectoryInformation(node) {
            if (Object.keys(node).length === 0) return;
            const aggMetrics = {
                aggFileCount: 0,
                aggCodeLines: 0,
                aggNormalizedWeight: 0,
                aggRawWeight: 0,
                worstNormalizedWeight: 0,
                worstRawWeight: 0,
            };
            this.calculateAggMetrics(node, aggMetrics);
            const tableEl = document.createElement("table");
            tableEl.setAttribute("id", "node-directory-information-table")
            const attributes = [
                {
                    "label": "Number of Files",
                    "value": this.numberWithCommas(aggMetrics.aggFileCount),
                }, 
                {
                    "label": "Total Size",
                    "value": `${this.numberWithCommas(aggMetrics.aggCodeLines)} Lines of Code`,
                },
                {
                    "label": "Hotspot Score, Average",
                    "value": (aggMetrics.aggNormalizedWeight / aggMetrics.aggFileCount).toFixed(2),
                },
                {
                    "label": "Hotspot Score, Worst",
                    "value": aggMetrics.worstNormalizedWeight.toFixed(2),
                },
            ]
            attributes.forEach((a) => tableEl.appendChild(this.makeTableRow(a)));

            const headerEl = document.createElement("h3");
            headerEl.setAttribute("id", "node-directory-information-header")
            headerEl.textContent = "Aggregated Metrics"
            const divEl = document.createElement("div");
            divEl.appendChild(headerEl);
            divEl.appendChild(tableEl);
            return divEl;
        },
        makeTableRow(attribute) {
            const labelSpan = document.createElement("span");
            labelSpan.textContent = attribute.label;
            labelSpan.classList.add("label");
            const labelTd = document.createElement("td");
            labelTd.appendChild(labelSpan);

            const valueSpan = document.createElement("span");
            valueSpan.textContent = attribute.value;
            valueSpan.classList.add("value");
            const valueTd = document.createElement("td");
            valueTd.appendChild(valueSpan);

            const tr = document.createElement("tr");
            tr.appendChild(labelTd);
            tr.appendChild(valueTd);
            return tr;
        },
        calculateAggMetrics(node, soFar) {
            if (!node.children) {
                // Base case - update so far and return;
                soFar.aggFileCount += 1;
                soFar.aggCodeLines += Number(node.data.code_lines);
                soFar.aggNormalizedWeight += Number(node.data.normalized_weight);
                soFar.aggRawWeight += Number(node.data.raw_weight);
                if (Number(node.data.normalized_weight) > soFar.worstNormalizedWeight) {
                    soFar.worstNormalizedWeight = Number(node.data.normalized_weight);
                }
                if (Number(node.data.raw_weight) > soFar.worstRawWeight) {
                    soFar.worstRawWeight = Number(node.data.raw_weight);
                }
                return;
            }

            node.children.forEach((c) => {
                this.calculateAggMetrics(c, soFar);
            });
        },
        numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }
});
</script>

<style lang="scss">

</style>