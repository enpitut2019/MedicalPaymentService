<template>
  <div>
    <div class="header">
      <img src="./testlogo.png" />
      <p>TODO:ロゴをちゃんとしたものに差し替える</p>
    </div>
    <div class="page">
      <div class="fullscreen" v-if="isCameraActive">
        <qrcode-stream @decode="inputData"></qrcode-stream>
      </div>
      <div class="container">
        <div class="containerTitle">
          <h1>Patient Information</h1>
        </div>
        <div class="list">
          <dl>
            <span v-for="(value, name, index) in patientData" :key="index">
              <dt>{{name}}</dt>
              <dd>{{value}}</dd>
            </span>
          </dl>
        </div>
      </div>
      <ui-button @click="isCameraActive = true" v-if="!patientDataActive">QRコードの読込</ui-button>
      <ui-button @click="inputPreSetData" v-if="!patientDataActive">テスト用：テスト用データの読み込み</ui-button>
      <ui-button @click="deployContract" v-if="patientDataActive">患者専用のアドレスを発行</ui-button>
      <ui-button
        @click="patientData = ''; patientDataActive = false"
        v-if="patientDataActive"
      >読み込みデータの破棄</ui-button>
      <ui-button
        @click="load('0xFA8AFb171e3793763CF7a8A4FF47A98edFfC759A')"
        v-if="patientDataActive"
      >テスト用：発行後画面へ遷移</ui-button>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      isCameraActive: false,
      patientDataActive: false,
      encryptedPatientData: "",
      patientSign: "",
      patientPassPhrase: "",
      patientData: ""
    };
  },
  methods: {
    inputData(result) {
      let sourceArray = result.split(",");
      this.patientPassPhrase = sourceArray[0];
      this.encryptedPatientData = sourceArray[1];
      this.patientSign = sourceArray[2];
      // 復号
      let patientDataJson = this.$management.decrypt(
        this.encryptedPatientData,
        this.patientPassPhrase
      );
      this.patientData = JSON.parse(patientDataJson);
      this.patientDataActive = true;
      this.isCameraActive = false;
    },
    inputPreSetData() {
      this.encryptedPatientData =
        "U2FsdGVkX1/LpZNWoiYkHGwVg5Xc9kDXnHEnUrQve8CHZBT9mjNmxkWSaw036mmL";
      this.patientSign =
        "0x4fe7087edc216dda60323737c8ecd886016736ab94b1dad57180a5ca6939815722c9f41fe3d96f439f7569395bb90740bce1cec719ec64fdb1b5e467a87903ce1b";
      this.patientPassPhrase =
        "0x5f5278ef122e68c6a0d4e037289317178a0555aad18e5cd1366df39683483b1785bc632ac5c7981a9a98e5660ec35e";
      let patientDataJson = this.$management.decrypt(
        this.encryptedPatientData,
        this.patientPassPhrase
      );
      this.patientData = JSON.parse(patientDataJson);
      this.patientDataActive = true;
    },
    async deployContract() {
      // TODO 画面ぐるぐる
      await this.$management.deploy(
        this.encryptedPatientData,
        this.patientSign,
        this.patientPassPhrase
      );
    },
    async load(contractAddress) {
      // DetailページをPush
      this.$router.push({
        name: "detail",
        params: { address: contractAddress }
      });
    },
    callBackFunc(event, value) {
      if (value.hospitalAddress === this.$management.getAddress()) {
        console.log("deploy contract address : " + value.contractAddress);
        this.load(value.contractAddress);
      }
    }
  },
  mounted: function() {
    this.$management.subscribeEvent(this.callBackFunc);
  }
};
</script>

<style scoped>
/*============================================
アニメーション
============================================*/

.v-enter {
  opacity: 0;
}
.v-enter-to {
  opacity: 1;
}
.v-enter-active {
  transition: opacity 200ms ease-out;
}
</style>