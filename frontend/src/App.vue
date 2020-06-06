<template>
  <v-app id="inspire">
    <v-app-bar app fixed clipped-left class="grey">
      <img
        src="./assets/images/start.png"
        class="toolbarButton"
        @click="newGame()"
        :title="$t('menu.newGame.tooltip')"
      />
      <img
        src="./assets/images/reverse.png"
        class="toolbarButton"
        @click="toggleBoardSide()"
        :title="$t('menu.reverseBoard.tooltip')"
      />
      <img
        src="./assets/images/stop.png"
        class="toolbarButton"
        @click="stopGame()"
        :title="$t('menu.stopGame.tooltip')"
      />
    </v-app-bar>
    <v-content class="white">
      <v-container fluid class="px-0">
        <v-layout justify-center align-center class="px-0">
          <game-zone ref="game_zone"></game-zone>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer app fixed class="grey">
      <span style="margin-left:1em">&copy; Laurent Bernabe - 2020</span>
    </v-footer>
  </v-app>
</template>

<script>
import GameZone from "./components/GameZone.vue";

export default {
  data: () => ({
    drawer: false
  }),
  components: {
    GameZone
  },
  props: {
    source: String
  },
  methods: {
    toggleBoardSide() {
      this.$refs["game_zone"].reverseBoard();
    },
    newGame() {
      this.$refs["game_zone"].requestStartNewGame();
    },
    stopGame() {
      this.$refs["game_zone"].requestStopGame();
    }
  },
  mounted() {
    this.$i18n.locale = navigator.language.substring(0, 2);
  }
};
</script>

<style>
.toolbarButton {
  width: 50px;
  height: 50px;
  margin: 5px;
}
</style>