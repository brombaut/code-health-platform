<template>
  <div id="system-path"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "SystemPath",
    props: {
        selectedNode: {
            type: Object,
            required: true,
        }
    },
    watch: {
        selectedNode(newNode) {
            this.selectedNodesSystemPath(newNode);
        },
    },
    methods: {
        selectedNodesSystemPath(node) {
            if (Object.keys(node).length === 0) return;
            const currPath = [];
            let temp = node;
            while (temp.parent) {
                currPath.unshift(temp);
                temp = temp.parent;
            }

            const el = this.$el;
            el.innerHTML = "";
            el.appendChild(this.systemPathPrefixLabelEl(currPath.length === 0));
            el.appendChild(this.systemPathComponentSeparatorEl());
            for (let i=0; i < currPath.length; i++) {
                const isSelectable = i < currPath.length - 1;
                el.appendChild(this.systemPathComponentEl(currPath[i], isSelectable));
                if (isSelectable) {
                    el.appendChild(this.systemPathComponentSeparatorEl());
                }
            }
        },
        systemPathPrefixLabelEl(isSelected) {
            const el = document.createElement("span");
            el.setAttribute("id", "prefix-label");
            el.textContent = "System";
            if (isSelected) {
                el.classList.add("selected");
            } else {
                el.classList.add("selectable");
                // TODO: This
                // el.addEventListener("mouseenter", this.callbacks.makeMouseEnter(null));
                // el.addEventListener("mouseleave", this.callbacks.makeMouseLeave(null));
            }
            // TODO: This
            // el.addEventListener("click", this.callbacks.makeSelected(null));
            return el;
        },
        systemPathComponentSeparatorEl() {
            const el = document.createElement("span");
            el.classList.add("system-component-separator");
            el.textContent = "/";
            return el;
        },
        systemPathComponentEl(node, isSelectable) {
            const el = document.createElement("span");
            el.classList.add("system-component");
            if (isSelectable) {
                el.classList.add("selectable");
                // TODO: This
                // el.addEventListener("mouseenter", this.callbacks.makeMouseEnter(node));
                // el.addEventListener("mouseleave", this.callbacks.makeMouseLeave(node));
                // el.addEventListener("click", this.callbacks.makeSelected(node));
            } else {
                // if not selectable, it is selected
                el.classList.add("selected");
            }
            el.textContent = node.data.name;
            return el;
        }
    }
});
</script>

<style lang="scss">
#system-path {
    #prefix-label,
    .system-component-separator,
    .system-component {
        margin: 0px 2px;
        font-weight: bold;
        color:rgb(83, 83, 83);
    }

    #prefix-label.selectable,
    .system-component.selectable {
        color: var(--selectable-color);
    }

    #prefix-label.selectable:hover,
    .system-component.selectable:hover {
        cursor: pointer;
        color: var(--hover-color);
    }

    #prefix-label.selected,
    .system-component.selected {
        color: var(--selected-color);
    }
}
</style>