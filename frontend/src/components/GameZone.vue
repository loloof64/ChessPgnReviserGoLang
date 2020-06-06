<template>
  <v-row fluid class="white">
    <v-col>
      <loloof64-chessboard
        size="600"
        white_cell_color="navajowhite"
        black_cell_color="peru"
        background="brown"
        white_player_human="true"
        black_player_human="true"
        :reversed="board_reversed"
        :promotion_dialog_title="promotion_dialog_title"
        @checkmate="handleCheckmate($event)"
        @stalemate="handleStalemate()"
        @perpetual-draw="handlePerpetualDraw()"
        @missing-material-draw="handleMissingMaterialDraw()"
        @fifty-moves-draw="handleFiftyMovesDraw()"
        @move-done="addMoveToHistory($event)"
      />
    </v-col>

    <v-col>
      <history ref="history" :history="orderedHistory" @position_requested="setPosition($event)" />
    </v-col>

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

    <simple-modal-dialog ref="errorDialog" :title="errorDialogTitle">
      <v-card-text>{{errorDialogText}}</v-card-text>
    </simple-modal-dialog>

    <pgn-game-selector ref="pgnGameSelector" :confirmAction="loadPgn" :pgnGames="pgnGames" />

    <v-progress-circular indeterminate size="300" width="20" color="light-blue" v-if="loadingPgn"></v-progress-circular>

    <simple-snack-bar ref="snackBar" />
  </v-row>
</template>

<script>
import SimpleModalDialog from "./SimpleModalDialog";
import SimpleSnackBar from "./SimpleSnackBar";
import MovesHistory from "./MovesHistory";
import PgnGameSelector from "./PgnGameSelector";

const pgnParser = require("pgn-parser");

/*
    History should be something like (here simplified)
    [
        {
            moveNumber: 1,
            whiteTurn: true,
            moveFan: "e4"
        },
        {
            moveNumber: 1,
            whiteTurn: false,
            moveFan: "Nc6"
        },
        {
            moveNumber: 2,
            whiteTurn: true,
            moveFan: "Nf3"
        },
        {
            moveNumber: 2,
            whiteTurn: false,
            moveFan: "e5"
        },
    ]
    orderedHistory should be something like (here simplified)
    [
        {
          moveNumber: 1,
          white: {
            moveFan: "e4"
          },
          black: {
            moveFan: "Nc6"
          }
        },
        {
          moveNumber: 2,
          white: {
            moveFan: "Nf3"
          },
          black: {
            moveFan: "e5"
          }
        },
      ]
    */

export default {
  data() {
    return {
      board_reversed: false,
      history: [],
      orderedHistory: [],
      errorDialogTitle: "",
      errorDialogText: "",
      pgnGames: [],
      loadingPgn: false
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
      ///////////////////////////////////////////////////////////////////////////////
      // Production mode, use window.backend.TextFileManager.GetTextFileContent()
      ///////////////////////////////////////////////////////////////////////////////
      window.backend.TextFileManager.GetTextFileContentWithPathProviden(
        "/home/laurent-bernabe/Documents/Echecs/Parties/GMI/Andersson.pgn"
      )
        .then(content => {
          try {
            this.loadingPgn = true;
            this.pgnGames = pgnParser.parse(content);
            this.loadingPgn = false;
            this.$refs["pgnGameSelector"].open(this.pgnGames);
          } catch (error) {
            console.error(error);
            this.errorDialogTitle = this.$i18n.t("modals.error.title");
            this.errorDialogText = this.$i18n.t("modals.error.pgn_parsing");
            this.$refs["errorDialog"].open();
          }
        })
        .catch(error => {
          console.error(error);
          this.errorDialogTitle = this.$i18n.t("modals.error.title");
          this.errorDialogText = this.$i18n.t("modals.error.file_reading");
          this.$refs["errorDialog"].open();
        });
    },
    doStopGame() {
      const boardComponent = document.querySelector("loloof64-chessboard");
      boardComponent.stop();
      this.$refs["history"].selectLastMove();
    },
    handleCheckmate(event) {
      const whiteTurnBeforeMove = event.detail.whiteTurnBeforeMove;
      const side = whiteTurnBeforeMove
        ? this.$i18n.t("gameFinished.whiteSide")
        : this.$i18n.t("gameFinished.blackSide");
      const message = this.$i18n.t("gameFinished.checkmate", { side });
      this.$refs["snackBar"].open(message);
      this.$refs["history"].selectLastMove();
    },
    handleStalemate() {
      const message = this.$i18n.t("gameFinished.stalemate");
      this.$refs["snackBar"].open(message);
      this.$refs["history"].selectLastMove();
    },
    handlePerpetualDraw() {
      const message = this.$i18n.t("gameFinished.perpetualDraw");
      this.$refs["snackBar"].open(message);
      this.$refs["history"].selectLastMove();
    },
    handleMissingMaterialDraw() {
      const message = this.$i18n.t("gameFinished.missingMaterialDraw");
      this.$refs["snackBar"].open(message);
      this.$refs["history"].selectLastMove();
    },
    handleFiftyMovesDraw() {
      const message = this.$i18n.t("gameFinished.fiftyMovesDraw");
      this.$refs["snackBar"].open(message);
      this.$refs["history"].selectLastMove();
    },
    updateOrderedHistory() {
      let currentMoveNumber = undefined;
      let currentHistoryLine = undefined;
      let update = this.history.reduce((acc, curr) => {
        if (currentMoveNumber !== curr.moveNumber) {
          if (currentHistoryLine !== undefined) {
            acc.push(currentHistoryLine);
          }
          currentMoveNumber = curr.moveNumber;
          currentHistoryLine = { moveNumber: currentMoveNumber };
        }
        if (curr.whiteTurn) {
          currentHistoryLine["white"] = curr;
        } else {
          currentHistoryLine["black"] = curr;
        }
        return acc;
      }, []);
      // Don't forget to push the current edited element if any !
      if (currentHistoryLine !== undefined) {
        update.push(currentHistoryLine);
      }
      this.orderedHistory = update;
    },
    addMoveToHistory: function(event) {
      this.history = [...this.history, event.detail.moveObject];
      this.updateOrderedHistory();
      const boardComponent = document.querySelector("loloof64-chessboard");
      if (!boardComponent.gameIsInProgress()) {
        this.$refs["history"].selectLastMove();
      }
    },
    setPosition: function(evt) {
      const board = document.querySelector("loloof64-chessboard");
      let success;
      if (evt !== undefined) {
        const whitePlayer = evt.whitePlayer;
        const historyIndex = evt.historyIndex;
        const historyLine = this.orderedHistory[historyIndex];
        let positionObject = whitePlayer
          ? historyLine.white
          : historyLine.black;
        success = board.setPositionAndLastMove({ ...positionObject });
      } else {
        success = board.setPositionAndLastMove();
      }
      if (success) {
        const historyComponent = this.$refs["history"];
        historyComponent.confirmPositionSet(evt);
      }
    },
    loadPgn(index) {
      const game = this.pgnGames[index];
      if (!game) {
        console.error(
          "Out of bounds ! Requested game " +
            index +
            ", but size is " +
            this.pgnGames.length
        );
        return;
      }

      const boardComponent = document.querySelector("loloof64-chessboard");
      boardComponent.newGame();

      this.$refs["history"].clearSelection();
      this.history = [];
      this.updateOrderedHistory();
    }
  },
  computed: {
    promotion_dialog_title() {
      return this.$i18n.t("modals.promotionDialog.title");
    }
  },
  components: {
    "simple-modal-dialog": SimpleModalDialog,
    "simple-snack-bar": SimpleSnackBar,
    history: MovesHistory,
    "pgn-game-selector": PgnGameSelector
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v-progress-circular {
  position: absolute;
  z-index: 5;
  top: 25%;
  left: 25%;
  width: 50%;
  height: 50%;
}
</style>
