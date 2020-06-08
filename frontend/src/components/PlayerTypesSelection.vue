<template>
  <v-dialog v-model="opened" persistent max-width="450">
    <v-card>
      <v-card-title class="headline d-flex justify-center">{{title}}</v-card-title>
      <v-row>
        <v-col
          class="side-text lg-1 d-flex justify-end align-center"
        >{{$t('history.header.whiteSide')}}</v-col>
        <v-row class="lg-11">
          <img class="type-icon" src="../assets/images/human.png" />
          <v-switch class="type-switch" v-model="white_is_computer" />
          <img class="type-icon" src="../assets/images/computer.png" />
        </v-row>
      </v-row>

      <v-row class="d-flex justify-center align-center">
        <v-col class="side-text lg-1 d-flex justify-end">{{$t('history.header.blackSide')}}</v-col>
        <v-row class="lg-11">
          <img class="type-icon" src="../assets/images/human.png" />
          <v-switch class="type-switch" v-model="black_is_computer" />
          <img class="type-icon" src="../assets/images/computer.png" />
        </v-row>
      </v-row>

      <v-row class="d-flex justify-center">
        <v-btn @click="handleValidate">{{ $t('modals.global.validateButton') }}</v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  mounted() {
    this.title = this.$i18n.t("modals.playersTypesSelection.title");
  },
  data() {
    return {
      opened: false,
      white_is_computer: false,
      black_is_computer: false,
      title: ""
    };
  },
  methods: {
    handleValidate() {
      this.close();
      this.$emit("validated", {
        white_computer: this.white_is_computer,
        black_computer: this.black_is_computer
      });
    },
    open() {
      this.opened = true;
    },
    close() {
      this.opened = false;
    }
  }
};
</script>

<style scoped>
.side-text {
  margin-left: 12px;
}

.type-icon {
  width: 20px;
  height: 20px;
  margin: 0 12px;
  transform: translateY(20px);
}
</style>