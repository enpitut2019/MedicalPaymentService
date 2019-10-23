<template>
  <div>
    <div class="backbutton" @click="back">
      <span></span>
    </div>
    <div class="page">
      <div class="container">
        <div class="containerTitle">
          <h1>ステータス</h1>
        </div>
        <div class="list">
          <dl>
            <span>
              <dt>アドレス</dt>
              <dd>{{contractAddress}}</dd>
            </span>
            <span>
              <dt>デポジット金額</dt>
              <dd>{{deposit}}</dd>
            </span>
            <span v-if="!isSignCompleted">
              <dt>請求金額</dt>
              <dd>{{medicalCost/ 10 ** this.tokenData["decimals"]}} {{tokenData["symbol"]}}</dd>
            </span>
            <span v-if="isSignCompleted">
              <dt>未収金金額</dt>
              <dd>{{unpaidCost/ 10 ** this.tokenData["decimals"]}} {{tokenData["symbol"]}}</dd>
            </span>
            <span>
              <dt>発生した手数料</dt>
              <dd>{{usedEther*ethPrice}} JPY ({{usedEther}} ETH)</dd>
            </span>
          </dl>
        </div>
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
      <ui-textbox v-model="inputMedicalCost" label="Medical Cost"></ui-textbox>
      <ui-button @click="setMedicalCost">テスト用：医療費を入力</ui-button>
    </div>
  </div>
</template>

<script>
import Examination from "./examination.js";

export default {
  data: function() {
    return {
      examination: "",
      contractAddress: "0x0",
      tokenData: "",
      medicalCost: 0,
      deposit: 0,
      unpaidCost: 0,
      usedEther: 0,
      ethPrice: 0,
      isSignCompleted: false,
      patientAddress: "0x0",
      patientData: "",
      inputMedicalCost: ""
    };
  },
  methods: {
    async init() {
      // TODO 画面ぐるぐる
      this.contractAddress = this.$route.params.address;
      this.examination = new Examination(
        this.$management,
        this.contractAddress
      );

      // イベントの購読
      this.examination.subscribeEvent(this.callBackFunc);

      // トークン情報の取得
      this.tokenData = await this.examination.getTokenData();

      // 支払い状況の取得
      let paymentStatus = await this.examination.getPaymentStatus();
      this.deposit = paymentStatus[0];
      this.medicalCost = paymentStatus[1];
      this.unpaidCost = paymentStatus[2];
      this.isSignCompleted = paymentStatus[3];
      /*let test = await fetch(
        "https://api.coinmarketcap.com/v2/ticker/1027/?convert=JPY",
        {
          method: "GET"
        }
      );*/
      //res.data.quotes.JPY.price;
      //console.log(test);
      // 患者の情報を取得
      let patientInfo = await this.examination.getPatientInfo();
      this.patientAddress = patientInfo.address;
      this.patientData = JSON.parse(patientInfo.data);

      // コントラクトで使用したEther量を取得
      this.usedEther = await this.examination.getUsedEther();
    },
    async setMedicalCost() {
      await this.examination.setMedicalCost(this.inputMedicalCost);
    },
    callBackFunc(event, value) {
      if (event === "SetMedicalCost") this.medicalCost = value["medicalCost"];
      console.log(event);
      console.log(value);
    },
    back() {
      this.$router.push("/");
    }
  },
  created: function() {
    this.init();
  },
  destroyed: function() {
    console.log("destroy");
    this.examination.unload();
  }
};
</script>
