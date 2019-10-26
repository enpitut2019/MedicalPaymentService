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
            <ui-button @click="generateSignQRCode">医療費に同意</ui-button>
            <vue-qrcode v-if="signMedicalCost" :value="signMedicalCost" :options="{ width: 500 }"></vue-qrcode>
        </div>
    </div>
</template>

<script>
import Examination from "./examination.js";
import VueQrcode from "@chenfengyuan/vue-qrcode";

export default {
    components: {
        VueQrcode
    },
    data: function() {
        return {
            examination: "",
            contractAddress: "0x0",
            tokenData: { decimals: "" },
            medicalCost: 0,
            deposit: 0,
            unpaidCost: 0,
            usedEther: 0,
            patientAddress: "0x0",
            patientData: "",
            signMedicalCost: "",
        };
    },
    methods: {
        async init() {
            // TODO 画面ぐるぐる
            console.log("画面ぐるぐる開始");
            const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
            await sleep(1000);
            // コントラクトの読み込み
            this.contractAddress = this.$route.params.address;
            this.examination = new Examination(
                this.$management,
                this.contractAddress
            );
            // イベントの購読
            this.examination.subscribeEvent(this.callBackFunc);
            // 支払い状況の取得
            let promise1 = this.getPaymentStatus();
            // 患者の情報を取得
            let promise2 = this.getPatientInfo();
            // トークン情報の取得
            let promise3 = this.getToeknData();

            // 全てのプロミスを実行
            await Promise.all([promise1, promise2, promise3]);
            // TODO 画面ぐるぐる終了
            console.log("画面ぐるぐる終了");
        },
        async getPatientInfo() {
            let patientInfo = await this.examination.getPatientInfo();
            this.patientAddress = patientInfo.address;
            this.patientData = JSON.parse(patientInfo.data);
        },
        async getPaymentStatus() {
            let paymentStatus = await this.examination.getPaymentStatus();
            this.deposit = paymentStatus[0];
            this.medicalCost = paymentStatus[1];
            this.unpaidCost = paymentStatus[2];
            this.isSignCompleted = paymentStatus[3];
        },
        async getToeknData() {
            this.tokenData = await this.examination.getTokenData();
        },
        generateSignQRCode(){
            this.signMedicalCost = this.$management.signMessage(String(this.medicalCost));
            console.log(this.signMedicalCost);
        },
        callBackFunc(event, value) {
            console.log(event);
            console.log(value);
            if (event === "SetMedicalCost") this.medicalCost = value["medicalCost"];
        },
        back() {
            this.$router.push("/");
        }
    },
    created: function() {
        this.init();
    },
    destroyed: function() {
        this.examination.unload();
    }
};
</script>
