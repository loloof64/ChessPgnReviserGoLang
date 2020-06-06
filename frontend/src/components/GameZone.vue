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

      @checkmate="handleCheckmate($event)"
      @stalemate="handleStalemate()"
      @perpetual-draw="handlePerpetualDraw()"
      @missing-material-draw="handleMissingMaterialDraw()"
      @fifty-moves-draw="handleFiftyMovesDraw()"
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

    <simple-snack-bar ref="snackBar" />
  </v-container>
</template>

<script>
import SimpleModalDialog from './SimpleModalDialog';
import SimpleSnackBar from './SimpleSnackBar';

export default {
  data() {
    return {
      board_reversed: false,
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
    handleCheckmate(event) {
      const whiteTurnBeforeMove = event.detail.whiteTurnBeforeMove;
      const side = whiteTurnBeforeMove ? this.$i18n.t('gameFinished.whiteSide') : this.$i18n.t('gameFinished.blackSide');
      const message = this.$i18n.t('gameFinished.checkmate', {side})
      this.$refs["snackBar"].open(message);
    },
    handleStalemate() {
      const message = this.$i18n.t('gameFinished.stalemate');
      this.$refs['snackBar'].open(message);
    },
    handlePerpetualDraw() {
      const message = this.$i18n.t('gameFinished.perpetualDraw');
      this.$refs['snackBar'].open(message);
    },
    handleMissingMaterialDraw() {
      const message = this.$i18n.t('gameFinished.missingMaterialDraw');
      this.$refs['snackBar'].open(message);
    },
    handleFiftyMovesDraw() {
      const message = this.$i18n.t('gameFinished.fiftyMovesDraw');
      this.$refs['snackBar'].open(message);
    }
  },
  components: {
    "simple-modal-dialog": SimpleModalDialog,
    "simple-snack-bar": SimpleSnackBar,
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
