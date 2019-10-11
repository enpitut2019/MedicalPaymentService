<template>
  <div>
    <div>入力欄</div>
      <tr>
        <td>name <input type="text" v-model="inputName"></td>
        <td>address <input type="text" v-model="inputAddress"></td>
        <td>sex <input type="text" v-model="inputSex"></td>
        <td>age <input type="text" v-model="inputAge"></td>
        <td>options <input type="text" v-model="inputOptions"></td>
      </tr>
      <input type="button" @click="generate" value="生成">
      <vue-qrcode v-if="targetText" :value="targetText" :options="option" tag="img"></vue-qrcode>
      <p>qrcode_message is {{ targetText }}</p>
      <!-- <qrcode value="https://www.1stg.me" /> -->
  </div>
</template>

<script>
import VueQrcode from "@chenfengyuan/vue-qrcode";
// import Qrcode from 'vue-qrcode';
export default {
  components: {
    VueQrcode
  },
  data() {
    return {
      inputName: "",
      inputAddress: "",
      inputSex: "",
      inputAge: "",
      inputOptions: "",
      targetText: "",
      option: {
        errorCorrectionLevel: "M",
        maskPattern: 0,
        margin: 10,
        scale: 2,
        width: 300,
        color: {
          dark: "#000000FF",
          light: "#FFFFFFFF"
        }
      }
    };
  },
  methods: {
    generate: function() {
      this.targetText = this.inputName + ',' + this.inputAddress + ',' + this.inputSex + ',' + this.inputAge + ',' + this.inputOptions;
    }
  }
};
</script>
