<template>
  <div>
    <div class="backbutton" @click="back">
      <span></span>
    </div>
    <div class="page">
      <div class="container">
        <div class="containerTitle">
          <h1>Contract Information</h1>
        </div>
        <div class="list">
          <dl>
            <dt>アドレス</dt>
            <dd>{{contractAddress}}</dd>
            <dt>医療費</dt>
            <dd>{{medicalCost}}</dd>
            <dt>デポジット</dt>
            <dd>{{deposit}}</dd>
            <dt>未収金</dt>
            <dd>{{unpaidCost}}</dd>
            <dt>使用したEther</dt>
            <dd>{{usedEther}}</dd>
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
            <dt>Patient Address</dt>
            <dd>{{patientAddress}}</dd>
          </dl>
        </div>
      </div>
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
      medicalCost: 0,
      deposit: 0,
      unpaidCost: 0,
      usedEther: 0,
      patientAddress: "0x0",
      patientData: ""
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

      let paymentStatus = await this.examination.getPaymentStatus();
      this.deposit = paymentStatus[0];
      this.medicalCost = paymentStatus[1];
      this.unpaidCost = paymentStatus[2];

      // 患者の情報を取得
      let patientInfo = await this.examination.getPatientInfo();
      this.patientAddress = patientInfo.address;
      this.patientData = JSON.parse(patientInfo.data);

      // コントラクトで使用したEther量を取得
      this.usedEther = await this.examination.getUsedEther();
    },
    async setMedicalCost() {
      await this.examination.setMedicalCost(12345.6789);
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
