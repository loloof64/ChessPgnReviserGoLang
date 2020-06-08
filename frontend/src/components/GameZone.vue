<template>
  <v-row fluid class="white">
    <v-col>
      <loloof64-chessboard
        size="600"
        white_cell_color="navajowhite"
        black_cell_color="peru"
        background="brown"
        :white_player_human="white_computer !== true"
        :black_player_human="black_computer !== true"
        :reversed="board_reversed"
        :promotion_dialog_title="promotion_dialog_title"
        @checkmate="handleCheckmate($event)"
        @stalemate="handleStalemate()"
        @perpetual-draw="handlePerpetualDraw()"
        @missing-material-draw="handleMissingMaterialDraw()"
        @fifty-moves-draw="handleFiftyMovesDraw()"
        @move-done="handleMoveDone($event)"
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

    <simple-modal-dialog ref="noMoreMoveDialog" :title="$t('modals.noMoreMove.title')">
      <v-card-text>{{$t('modals.noMoreMove.text')}}</v-card-text>
    </simple-modal-dialog>

    <simple-modal-dialog ref="wrongMoveDialog" :title="$t('modals.wrongMove.title')">
      <v-card-text>{{$t('modals.wrongMove.text')}}</v-card-text>
    </simple-modal-dialog>

    <simple-modal-dialog ref="errorDialog" :title="errorDialogTitle">
      <v-card-text>{{errorDialogText}}</v-card-text>
    </simple-modal-dialog>

    <pgn-game-selector
      ref="pgnGameSelector"
      :confirmAction="startGameNextProcess"
      @error="handlePgnLoadingError"
    />

    <player-types-selection ref="playerTypesSelection" @validated="startGameLastProcess" />

    <moves-selection-dialog
      ref="cpuMovesSelectionDialog"
      @move-selected="handleComputerMoveSelected"
    />

    <simple-snack-bar ref="snackBar" />
  </v-row>
</template>

<script>
import SimpleModalDialog from "./SimpleModalDialog";
import SimpleSnackBar from "./SimpleSnackBar";
import MovesHistory from "./MovesHistory";
import PgnGameSelector from "./PgnGameSelector";
import PlayerTypesSelection from "./PlayerTypesSelection";
import MovesSelectionDialog from "./MovesSelectionDialog";

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
      pgnGamesContents: [],
      gameData: undefined,
      variationNode: undefined,
      variationMoveIndex: 0,
      white_computer: false,
      black_computer: false
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
        "/home/laurent-bernabe/Documents/temp/pgn/PgnDroitsRoot.pgn"
      ).then(async content => {
        if (content != "#ErrorReadingFile") {
          const pgnGamesContents = await this.splitPgn(content);

          if (pgnGamesContents.length === 0) {
            this.errorDialogTitle = this.$i18n.t("modals.noGameInPgn.title");
            this.errorDialogText = this.$i18n.t("modals.noGameInPgn.text");
            this.$refs["errorDialog"].open();
            return;
          }
          this.pgnGamesContents = pgnGamesContents;
          this.$refs["pgnGameSelector"].open(this.pgnGamesContents);
        } else {
          this.errorDialogTitle = this.$i18n.t("modals.error.title");
          this.errorDialogText = this.$i18n.t("modals.error.file_reading");
          this.$refs["errorDialog"].open();
        }
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
    addMoveToHistory: function(moveObject) {
      this.history = [...this.history, moveObject];
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
    handlePgnLoadingError(error) {
      console.error(error);
      this.errorDialogTitle = this.$i18n.t("modals.error.title");
      this.errorDialogText = this.$i18n.t("modals.error.pgn_parsing");
      this.$refs["errorDialog"].open();
    },
    splitPgn(pgnContent) {
      let results = [];
      const isOutOfGame = 0;
      const isInHeader = 1;
      const isInGame = 2;
      let status = isOutOfGame;
      let currentGame = "";
      const isAHeaderLine = l => l.startsWith("[");
      const isBlankLine = l => l.trim().length === 0;
      const lines = pgnContent.split(/\r?\n/);
      lines.forEach(l => {
        switch (status) {
          case isOutOfGame:
            if (isAHeaderLine(l)) {
              status = isInHeader;
              currentGame += l + "\n";
            } else if (!isBlankLine(l)) {
              status = isInGame;
              currentGame += l + "\n";
            }
            break;
          case isInHeader:
            if (status === isInGame) {
              results.push(currentGame);
              currentGame = "";
            }
            if (isAHeaderLine(l)) {
              currentGame += l + "\n";
            } else if (isBlankLine(l)) {
              status = isInGame;
              currentGame += "\n";
            } else {
              currentGame += l + "\n";
            }
            break;

          case isInGame:
            if (isAHeaderLine(l)) {
              results.push(currentGame);
              currentGame = "";
              status = isInHeader;
              currentGame += l + "\n";
            } else if (isBlankLine(l)) {
              results.push(currentGame);
              currentGame = "";
              status = isOutOfGame;
            } else {
              currentGame += l + "\n";
            }
        }
      });
      if (currentGame.length > 0) results.push(currentGame);
      return results;
    },
    startGameNextProcess(pgnData) {
      if (pgnData) {
        this.gameData = pgnData;
        this.$refs["playerTypesSelection"].open();
      }
    },
    startGameLastProcess({ white_computer, black_computer }) {
      this.white_computer = white_computer;
      this.black_computer = black_computer;

      setTimeout(() => {
        this.variationNode = this.gameData.moves;
        this.variationMoveIndex = 0;
        const startupPosition = this.gameData.startupPosition;
        const boardComponent = document.querySelector("loloof64-chessboard");
        boardComponent.newGame(startupPosition);

        this.$refs["history"].clearSelection();
        this.history = [];
        this.updateOrderedHistory();

        this.makeComputerPlayNextMoveIfAppropriate();
      }, 400);
    },
    handleMoveDone(event) {
      const boardComponent = document.querySelector("loloof64-chessboard");
      const isWhiteTurn = boardComponent.isWhiteTurn();
      const isComputerTurn =
        (isWhiteTurn === true && this.white_computer === true) ||
        (isWhiteTurn !== true && this.black_computer === true);

      const moveObject = event.detail.moveObject;
      const playedMoveSan = moveObject.moveSan;
      this.addMoveToHistory(moveObject);

      let allMoves = this.getExpectedMoves();

      const expectedMainMove = allMoves[0];
      allMoves.shift();
      const expectedVariationsMoves = allMoves;

      const isMainMove = playedMoveSan === expectedMainMove;
      const playedVariationIndex = expectedVariationsMoves
        ? expectedVariationsMoves.findIndex(
            currentVariation => currentVariation === playedMoveSan
          )
        : -1;

      if (isMainMove) {
        this.variationMoveIndex++;
        setTimeout(this.handleNextMove, isComputerTurn ? 500 : 0);
      } else if (playedVariationIndex >= 0) {
        this.variationNode = this.variationNode[this.variationMoveIndex].ravs[
          playedVariationIndex
        ].moves;
        this.variationMoveIndex = 1;
        setTimeout(this.handleNextMove, isComputerTurn ? 500 : 0);
      } else {
        if (!isComputerTurn) {
          boardComponent.stop();
          this.$refs["wrongMoveDialog"].open();
        }
      }
    },
    getExpectedMoves() {
      let result = [];

      if (this.variationMoveIndex <= this.variationNode.length - 1) {
        const currentNode = this.variationNode[this.variationMoveIndex];

        const mainMove = currentNode.move;
        result.push(mainMove);

        if (currentNode.ravs) {
          currentNode.ravs.forEach(variationNode => {
            const variation = variationNode.moves[0].move;
            result.push(variation);
          });
        }
      }
      return result;
    },
    handleNextMove() {
      const noMoreMove = this.variationMoveIndex >= this.variationNode.length;
      if (noMoreMove) {
        const boardComponent = document.querySelector("loloof64-chessboard");
        boardComponent.stop();

        this.$refs["noMoreMoveDialog"].open();
      } else {
        this.makeComputerPlayNextMoveIfAppropriate();
      }
    },
    makeComputerPlayNextMoveIfAppropriate() {
      const boardComponent = document.querySelector("loloof64-chessboard");
      const whiteTurn = boardComponent.isWhiteTurn();
      const isComputerMove =
        (whiteTurn === true && this.white_computer === true) ||
        (whiteTurn === false && this.black_computer === true);

      if (!isComputerMove) return;

      let allMoves = this.getExpectedMoves();

      const expectedMainMove = allMoves[0];
      allMoves.shift();
      const expectedVariationsMoves = allMoves;

      if (expectedVariationsMoves.length > 0) {
        this.$refs["cpuMovesSelectionDialog"].open({
          title: this.$i18n.t("modals.cpuMoves.title"),
          mainMove: expectedMainMove,
          variationMoves: expectedVariationsMoves,
          mainMoveLabel: this.$i18n.t("modals.cpuMoves.mainMoveLabel"),
          variationMovesLabel: this.$i18n.t(
            "modals.cpuMoves.variationsMovesLabel"
          )
        });
      } else {
        const boardComponent = document.querySelector("loloof64-chessboard");
        boardComponent.playMoveSan(expectedMainMove);
      }
    },
    handleComputerMoveSelected(playedMoveSan) {
      const boardComponent = document.querySelector("loloof64-chessboard");
      boardComponent.playMoveSan(playedMoveSan);

      setTimeout(() => {
        let allMoves = this.getExpectedMoves();

        const expectedMainMove = allMoves[0];
        allMoves.shift();
        const expectedVariationsMoves = allMoves;

        if (playedMoveSan === expectedMainMove) {
          this.variationMoveIndex++;
          this.handleNextMove();
        } else {
          const playedVariationIndex = expectedVariationsMoves.findIndex(
            moveToCompare => moveToCompare === playedMoveSan
          );
          const isAMatchingVaration = playedVariationIndex >= 0;
          if (isAMatchingVaration) {
            this.variationNode = this.variationNode[
              this.variationMoveIndex
            ].ravs[playedVariationIndex].moves;
            this.variationMoveIndex = 1;

            this.handleNextMove();
          }
        }
      }, 400);
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
    "pgn-game-selector": PgnGameSelector,
    "player-types-selection": PlayerTypesSelection,
    "moves-selection-dialog": MovesSelectionDialog
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
