<template>
  <v-app id="inspire">
    <v-app-bar app fixed clipped-left class="grey">

    </v-app-bar>
    <v-content>
      <v-container fluid class="px-0">
        <v-layout justify-center align-center class="px-0">
          <game-zone></game-zone>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer app fixed>
      <span style="margin-left:1em">&copy; Laurent Bernabe - 2020</span>
    </v-footer>
  </v-app>
</template>

<script>
  require('@loloof64/chessboard-component/dist')
  import GameZone from "./components/GameZone.vue"

  export default {
    data: () => ({
      drawer: false
    }),
    components: {
      GameZone
    },
    props: {
      source: String
    }
  }
</script>

<style>
  
</style>