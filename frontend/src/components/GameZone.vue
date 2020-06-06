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
  </v-container>
</template>

<script>

  export default {
    data () {
      return {
        board_reversed: false,
      }
    },
    methods: {
      reverseBoard() {
        this.board_reversed = ! this.board_reversed;
      },
      startNewGame() {
        const boardComponent = document.querySelector('loloof64-chessboard');
        boardComponent.newGame();
      },
      stopGame() {
        const boardComponent = document.querySelector('loloof64-chessboard');
        boardComponent.stop();
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
</style>
