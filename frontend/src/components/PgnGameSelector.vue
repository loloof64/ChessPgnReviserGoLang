<template>
  <simple-modal-dialog
    ref="root"
    id="root"
    :title="$t('modals.pgnSelection.title')"
    :confirmAction="handleConfirm"
    cancelButton
  >
    <v-layout id="rootLayout">
      <loloof64-chessboard
        ref="previewBoard"
        size="300"
        :white_player_human="false"
        :black_player_human="false"
        :left="10"
        :top="10"
        :reversed="previewBoardReversed"
        :background="boardBackgroundColor"
        :coordinates_color="coordinates_color"
        :white_cell_color="white_cell_color"
        :black_cell_color="black_cell_color"
        :coordinates_visible="true"
      ></loloof64-chessboard>

      <v-row id="previewPanel">
        <div id="previewControls">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" @click="goFirstPreview()" class="blue red--text">
                <v-icon>mdi-skip-previous</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('pgn.buttons.first') }}</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" @click="goPreviousPreview()" class="blue red--text">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('pgn.buttons.previous') }}</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" @click="goNextPreview()" class="blue red--text">
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('pgn.buttons.next') }}</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" @click="goLastPreview()" class="blue red--text">
                <v-icon>mdi-skip-next</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('pgn.buttons.last') }}</span>
          </v-tooltip>

          <span>
            <input
              id="numericalGameSelection"
              type="text"
              :value="selectedPgnIndex + 1"
              @keypress="handleNumericalSelection($event)"
            />
            / {{pgnsArray.length}}
          </span>
        </div>

        <div id="previewPlayers">{{ previewPgnWhitePlayer }} | {{ previewPgnBlackPlayer }}</div>

        <div id="previewEvent">{{ selectedPgnEvent }}</div>

        <div id="previewEventData">{{ selectedPgnSite }} {{ previewPgnDate }}</div>
      </v-row>
    </v-layout>
  </simple-modal-dialog>
</template>

<script>
import SimpleModalDialog from "./SimpleModalDialog";
import pgnReader from "../libs/pgn_parser/pgn";

export default {
  props: {
    confirmAction: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      previewBoardReversed: false,
      boardBackgroundColor: "brown",
      coordinates_color: "gold",
      white_cell_color: "navajowhite",
      black_cell_color: "peru",

      pgnsArray: [],
      selectedPgnIndex: -1,
      selectedPgnWhite: "",
      selectedPgnBlack: "",
      selectedPgnSite: "",
      selectedPgnDate: "",
      selectedPgnEvent: "",
    };
  },
  methods: {
    open(pgnTree) {
      this.pgnsArray = pgnTree;
      this.selectedPgnIndex = -1;
      this.$nextTick(() => {
        this.$refs["previewBoard"].newGame("8/8/8/8/8/8/8/8 w - - 0 1");
        this.goNextPreview();
      });
      this.$refs["root"].open();
    },
    goPreviousPreview() {
      if (this.selectedPgnIndex > 0) {
        this.selectedPgnIndex -= 1;
        this.previewPgn();
      }
    },
    goNextPreview() {
      if (this.selectedPgnIndex < this.pgnsArray.length - 1) {
        this.selectedPgnIndex += 1;
        this.previewPgn();
      }
    },
    goFirstPreview() {
      this.selectedPgnIndex = 0;
      this.previewPgn();
    },
    goLastPreview() {
      this.selectedPgnIndex = this.pgnsArray.length - 1;
      this.previewPgn();
    },
    previewPgn: function() {
      if (this.selectedPgnIndex > this.pgnsArray.length) return;
      const selectedPgnContent = this.pgnsArray[this.selectedPgnIndex];
      const loader = new pgnReader({pgn: selectedPgnContent});
      const gameData = loader.load_pgn();
      ////////////////////////////////
      console.log(gameData);
      ///////////////////////////////////
      const startupPosition = gameData.startupPosition;
      this.selectedPgnWhite = gameData.headers["White"];
      this.selectedPgnBlack = gameData.headers["Black"];
      this.selectedPgnSite = gameData.headers["Site"];
      this.selectedPgnDate = gameData.headers["Date"];
      this.selectedPgnEvent = gameData.headers["Event"];
      const playerHasBlack = startupPosition.split(" ")[1] !== "w";
      this.previewBoardReversed = playerHasBlack;
      const previewComponent = this.$refs["previewBoard"];
      previewComponent.newGame(startupPosition);
    },
    handleConfirm() {
      this.$refs["root"].close();
      this.confirmAction(this.selectedPgnIndex);
    },
    handleNumericalSelection(event) {
      const ENTER_KEY = 'Enter';
      const numericalSelectionComponent = document.querySelector(
        "#numericalGameSelection"
      );

      if (event.key === ENTER_KEY) {
        const value = numericalSelectionComponent.value;
        const selectedGameIndex = parseInt(value) - 1;
        if (!isNaN(selectedGameIndex)) {
          const inBounds =
            selectedGameIndex >= 0 && selectedGameIndex < this.pgnsArray.length;
          if (inBounds) {

            this.selectedPgnIndex = selectedGameIndex;
            this.previewPgn();
          } else {
            // reset to old value
            numericalSelectionComponent.value = this.selectedPgnIndex;
          }
        } else {
          // reset to old value
          numericalSelectionComponent.value = this.selectedPgnIndex;
        }
      }
    }
  },
  computed: {
    previewPgnWhitePlayer: function() {
      return this.selectedPgnWhite.length > 0 ? this.selectedPgnWhite : "???";
    },
    previewPgnBlackPlayer: function() {
      return this.selectedPgnBlack.length > 0 ? this.selectedPgnBlack : "???";
    },
    previewPgnDate: function() {
      return this.selectedPgnDate.length > 0
        ? "(" + this.selectedPgnDate + ")"
        : "";
    }
  },
  components: {
    "simple-modal-dialog": SimpleModalDialog
  }
};
</script>

<style scoped>
#previewPanel {
  margin: 10px;
}
#previewControls > .v-btn {
  margin-left: 10px;
  margin-right: 10px;
}
#previewPlayers, #previewEvent, #previewEventData {
  display: block;
  width: 300px;
  margin-left: 20px;
  margin-top: 20px;
}

#numericalGameSelection {
  text-align: right;
  background-color: white;
  color: black;
}
</style>