<template>
    <div class="page">
        <div class="container">
            <div class="containerTitle">
                <h1>Contract Information</h1>
            </div>
            <div class="list">
                <dl>
                    <dt>Medical Cost</dt>
                    <dd>
                        {{ medicalCost / 10 ** this.tokenData["decimals"] }}
                        {{ tokenData["symbol"] }}
                    </dd>
                    <dt>Unpaid Medical Cost</dt>
                    <dd v-if="!isSignCompleted">---</dd>
                    <dd v-if="isSignCompleted">
                        {{ unpaidCost / 10 ** this.tokenData["decimals"] }}
                        {{ tokenData["symbol"] }}
                    </dd>
                </dl>
            </div>
            <ui-button @click="generateSignQRCode"
                >Agree to Medical Cost</ui-button
            >
        </div>
        <div class="container">
            <div class="containerTitle">
                <h1>Deposit Info</h1>
            </div>
            <div class="list">
                <dl>
                    <span>
                        <dt>Remittance Address</dt>
                        <dd>{{ contractAddress }}</dd>
                    </span>
                    <span>
                        <dt>Deposit Value</dt>
                        <dd>
                            {{ deposit / 10 ** this.tokenData["decimals"] }}
                            {{ tokenData["symbol"] }}
                        </dd>
                    </span>
                </dl>
            </div>
            <ui-button @click="withDraw">Withdraw Deposit</ui-button>
        </div>
        <div class="container">
            <div class="containerTitle">
                <h1>Patient Information</h1>
            </div>
            <div class="list">
                <dl>
                    <span
                        v-for="(value, name, index) in patientData"
                        :key="index"
                    >
                        <dt>{{ name }}</dt>
                        <dd>{{ value }}</dd>
                    </span>
                </dl>
            </div>
        </div>
        <ui-modal ref="QRCodeModal" transition="scale-up">
            <div slot="header">
                <b>Show QRCode to Hospital</b>
            </div>
            <vue-qrcode
                v-if="medicalCostSign"
                :value="medicalCostSign"
                :options="{ width: 300 }"
            ></vue-qrcode>
        </ui-modal>
    </div>
</template>

<script>
import Examination from "./examination.js";
import VueQrcode from "@chenfengyuan/vue-qrcode";
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

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
            isSignCompleted: false,
            patientAddress: "0x0",
            patientData: "",
            medicalCostSign: ""
        };
    },
    created: async function() {
        this.$emit("loading", true);
        await sleep(1000);
        await this.init();
        this.$emit("loading", false);
    },
    methods: {
        async init() {
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
        generateSignQRCode() {
            this.medicalCostSign = this.$management.signMessage(
                String(this.medicalCost)
            );
            this.openModal("QRCodeModal");
        },
        withDraw() {
            // 実際はRefundを使う
            console.log("サーバーにアクセス - 未実装");
        },
        callBackFunc(event, value) {
            this.$emit("loading", true);
            console.log(event);
            console.log(value);
            if (event === "SetMedicalCost")
                this.medicalCost = value["medicalCost"];
            if (event === "SignMedicalCost")
                this.isSignCompleted = value["signed"];
            if (event === "WithDraw") this.unpaidCost = value["unpaidCost"];
            if (event === "Refund") console.log("Refund" + value["amount"]);
            this.$emit("loading", false);
        },
        back() {
            this.$router.push("/");
        },
        openModal(ref) {
            this.$refs[ref].open();
        },
        closeModal(ref) {
            this.$refs[ref].close();
        }
    },
    destroyed: function() {
        this.examination.unload();
    }
};
</script>
