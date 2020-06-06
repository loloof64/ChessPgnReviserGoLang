<template>
  <v-container fluid class="px-0 white">
    <loloof64-chessboard
      size="600"
      white_cell_color="navajowhite"
      black_cell_color="peru"
      background="brown"
      white_player_human="true"
      black_player_human="true"
      :reversed="board_reversed"
    />

    <simple-modal-dialog
      ref="newGameConfirmation"
      :title="$t('modals.newGame.title')"
      :confirmAction="doStartNewGame"
      cancelButton
    >
      <v-card-text>{{$t('modals.newGame.text')}}</v-card-text>
    </simple-modal-dialog>

    <simple-modal-dialog
      ref="stopGameConfirmation"
      :title="$t('modals.stopGame.title')"
      :confirmAction="doStopGame"
      cancelButton
    >
      <v-card-text>{{$t('modals.stopGame.text')}}</v-card-text>
    </simple-modal-dialog>
  </v-container>
</template>

<script>
import SimpleModalDialog from './SimpleModalDialog';

export default {
  data() {
    return {
      board_reversed: false
    };
  },
  methods: {
    reverseBoard() {
      this.board_reversed = !this.board_reversed;
    },
    requestStartNewGame() {
      this.$refs["newGameConfirmation"].open();
    },
    requestStopGame() {
      const boardComponent = document.querySelector("loloof64-chessboard");
      if (boardComponent.gameIsInProgress()) {
        this.$refs["stopGameConfirmation"].open();
      }
    },
    doStartNewGame() {
      const boardComponent = document.querySelector("loloof64-chessboard");
      boardComponent.newGame();
    },
    doStopGame() {
      const boardComponent = document.querySelector("loloof64-chessboard");
      boardComponent.stop();
    },
  },
  components: {
    "simple-modal-dialog": SimpleModalDialog,
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
