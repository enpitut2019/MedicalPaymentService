<template>
  <div>
    <div>入力欄</div>
    <tr>
      <td>
        name
        <input type="text" v-model="inputName" />
      </td>
      <td>
        age
        <input type="text" v-model="inputAge" />
      </td>
    </tr>
    <input type="button" @click="generate" value="生成" />
    <vue-qrcode v-if="encrypted_strings" :value="encrypted_strings" :options="option" tag="img"></vue-qrcode>
  </div>
</template>

<script>
import VueQrcode from "@chenfengyuan/vue-qrcode";
export default {
  components: {
    VueQrcode
  },
  data() {
    return {
      inputName: "",
      inputAge: "",
      targetText: "",
      encrypted_strings: "",
      txt_key: localStorage.getItem("passPhrase"),
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
      let CryptoJS = require("crypto-js");
      let AES = require("crypto-js/aes");
      this.targetText =
        this.inputName +
        "," +
        this.inputAge;
      let utf8_plain = CryptoJS.enc.Utf8.parse(this.targetText);
      let encrypted = CryptoJS.AES.encrypt(utf8_plain, this.txt_key);
      this.encrypted_strings = this.txt_key + "," + encrypted.toString();
    }
  }
};
</script>
