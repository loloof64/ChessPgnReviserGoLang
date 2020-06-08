<template>
  <v-dialog v-model="opened" persistent max-width="400">
    <v-card>
      <v-card-title class="headline">{{title}}</v-card-title>
      <div class="move-block d-flex justify-center align-center">
        <v-col>
          <span>{{mainMoveLabel}}</span>
          <span @click="handleMainMoveSelected()">{{mainMove.fan}}</span>
        </v-col>
      </div>
      <div id="movesZone" v-if="variationMoves.length > 0" class="move-block d-flex justify-center align-center">
        <v-col v-for="move in variationMoves" :key="move.san">
          <span>{{variationMovesLabel}}</span>
          <span @click="handleVariationMoveSelected(move.san)">{{move.fan}}</span>
        </v-col>
      </div>
      <v-row id="button-line" class="d-flex justify-center">
        <v-btn v-if="closeButton" @click="close" class="align-center">{{$t('modals.global.okButton')}}</v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    closeButton: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      opened: false,
      title: "",
      mainMoveLabel: "",
      variationMovesLabel: "",
      mainMove: {},
      variationMoves: []
    };
  },
  methods: {
    open({
      title,
      mainMove,
      variationMoves,
      mainMoveLabel,
      variationMovesLabel
    }) {
      this.title = title;
      this.mainMove = mainMove;
      this.variationMoves = variationMoves;
      this.mainMoveLabel = mainMoveLabel;
      this.variationMovesLabel = variationMovesLabel;

      this.opened = true;
    },
    close() {
      this.opened = false;
    },
    handleMainMoveSelected() {
      if (!this.closeButton) {
        this.opened = false;
        this.$emit("move-selected", this.mainMove.san);
      }
    },
    handleVariationMoveSelected(move) {
      if (!this.closeButton) {
        this.opened = false;
        this.$emit("move-selected", move);
      }
    }
  }
};
</script>

<style scoped>
.v-card {
  background-color: white;
  color: black;
}

#movesZone {
  overflow: scroll;
  height: 200px;
}

span {
    display: block;
    width: 300px;
    text-align: center;
    font-size: 30px;
}
</style>