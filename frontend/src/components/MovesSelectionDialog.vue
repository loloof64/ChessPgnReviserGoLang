<template>
  <v-dialog v-model="opened" persistent max-width="500">
    <v-card>
      <v-card-title class="headline">{{title}}</v-card-title>
      <div class="move-block d-flex justify-center align-center">
        <v-col>
          <span>{{mainMoveLabel}}</span>
          <span @click="handleMainMoveSelected()">{{mainMove.fan}}</span>
        </v-col>
      </div>
      <div id="movesZone" class="move-block d-flex justify-center align-center">
        <v-col v-for="move in variationMoves" :key="move.san">
          <span>{{variationMovesLabel}}</span>
          <span @click="handleVariationMoveSelected(move.san)">{{move.fan}}</span>
        </v-col>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      opened: false,
      title: "",
      mainMoveLabel: "",
      variationMovesLabel: "",
      mainMove: undefined,
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

      if (this.variationMoves.length > 0) {
        this.opened = true;
      }
    },
    handleMainMoveSelected() {
      this.opened = false;
      this.$emit("move-selected", this.mainMove.san);
    },
    handleVariationMoveSelected(move) {
      this.opened = false;
      this.$emit("move-selected", move);
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