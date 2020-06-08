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
          <game-zone ref="game_zone" @new-game="handleNewGame"></game-zone>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer app fixed class="grey">
      <span id="copyright">&copy; Laurent Bernabe - 2020</span>
      <span>{{$t('history.header.whiteSide')}} : </span>
      <img :src='whiteSideImage()' class="sideImage" :alt="$t('history.header.whiteSide')" />
      <span>&nbsp;/&nbsp;</span>
      <span>{{$t('history.header.blackSide')}} : </span>
      <img :src='blackSideImage()' class="sideImage" :alt="$t('history.header.blackSide')" />
    </v-footer>
  </v-app>
</template>

<script>
import GameZone from "./components/GameZone.vue";

const unavailableImage = require('./assets/images/unavailable.png');
const humanImage = require('./assets/images/human.png');
const computerImage = require('./assets/images/computer.png');

export default {
  data: () => ({
    drawer: false,
    white_computer: undefined,
    black_computer: undefined,
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
    },
    whiteSideImage() {
      if (this.white_computer === undefined) return unavailableImage;
      if (this.white_computer === true) return computerImage;
      return humanImage;
    },
     blackSideImage() {
      if (this.black_computer === undefined) return unavailableImage;
      if (this.black_computer === true) return computerImage;
      return humanImage;
    },
    handleNewGame({white_computer, black_computer}) {
      this.white_computer = white_computer;
      this.black_computer = black_computer
    }
  },
  mounted() {
    this.$i18n.locale = navigator.language.substring(0, 2);
  }
};
</script>

<style>
.v-footer span {
  margin: 0 1em;
}
.toolbarButton {
  width: 50px;
  height: 50px;
  margin: 5px;
}

.sideImage {
  width: 30px;
  height: 30px;
  margin: 5px;
}
</style>