<template>
  <header>
    <!-- TODO: Header -->
    <h1>Code Health</h1>
  </header>

  <main>
    <section id="left-pane" class="flex-row">
      <EnclosurePane :systemStructure="systemStructure"/>
    </section>
    <section id="right-pane" class="flex-column">
      <InfoPane />
      <DependencyPane />
    </section>
  </main>
</template>


<script lang="ts">
import { defineComponent } from 'vue'
import InfoPane from "./components/InfoPane.vue";
import EnclosurePane from "./components/EnclosurePane.vue";
import DependencyPane from "./components/DependencyPane.vue";
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
      systemStructure
    };
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
