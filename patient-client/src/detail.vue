<template>
    <div class="page">
        <ui-alert
            type="success"
            :dismissible="false"
            v-show="isPaymentCompleted"
        >
            医療機関に{{ amountAddSymbol(paidToHospital) }}支払い、{{
                amountAddSymbol(paidToPatient)
            }}返金されました
        </ui-alert>
        <ui-alert
            type="warning"
            :dismissible="false"
            v-show="isPaymentCompleted"
        >
            返金を受け取るためには任意のウォレットで秘密鍵「{{
                privateKey
            }}」をインポートする必要があります
        </ui-alert>
        <div class="container">
            <div class="containerTitle">
                <h1>Payment Information / 支払い状況</h1>
            </div>
            <div class="list">
                <dl>
                    <dt>Deposit Value</dt>
                    <dd>{{ amountAddSymbol(deposit) }}</dd>
                    <dt>Medical Cost</dt>
                    <dd>{{ amountAddSymbol(medicalCost) }}</dd>
                    <dt>Unpaid Medical Cost</dt>
                    <dd v-if="!isSignCompleted">---</dd>
                    <dd v-if="isSignCompleted">
                        {{ amountAddSymbol(unpaidCost) }}
                    </dd>
                </dl>
            </div>
            <div class="center" v-if="!isSignCompleted">
                <vue-qrcode
                    v-if="medicalCostSign"
                    :value="medicalCostSign"
                    :options="{ width: winodwWidth * 0.8 }"
                ></vue-qrcode>
                <button class="button button--wide" @click="generateSignQRCode">
                    Agree to Medical Cost / 医療費に同意
                </button>
            </div>
        </div>
        <div class="container">
            <div class="containerTitle">
                <h1>Simple medical records / 簡易的な診療記録</h1>
            </div>
            <div class="list">
                <dl>
                    <span v-for="(item, index) in medicalNotes" :key="index">
                        <dt>
                            {{ formatDate(item.timestamp * 1000) }}
                        </dt>
                        <dd>{{ item.note }}</dd>
                    </span>
                </dl>
            </div>
        </div>
        <div class="container">
            <div class="containerTitle">
                <h1>Your Information on Blockchain / あなたの情報</h1>
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
        <div class="container">
            <div class="containerTitle">
                <h1>Your Examination Address / 発行された専用アドレス</h1>
            </div>
            <div class="center">
                <vue-qrcode
                    :value="contractAddress"
                    :options="{ width: winodwWidth * 0.5 }"
                ></vue-qrcode>
            </div>
        </div>
        <div class="center" v-if="isPaymentCompleted">
            <button class="button button--wide" @click="reset">
                診療を終了する（インポート完了後）
            </button>
        </div>
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
            tokenAddress: "0x0",
            tokenData: {},
            tokenAddress: "",
            medicalCost: 0,
            deposit: 0,
            unpaidCost: 0,
            isSignCompleted: false,
            patientAddress: "0x0",
            patientData: "",
            medicalCostSign: "",
            medicalNotes: false,
            winodwWidth: window.innerWidth,
            isPaymentCompleted: false,
            paidToHospital: 0,
            paidToPatient: 0,
            privateKey: localStorage.getItem("patientPrivateKey")
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
            this.contractAddress = this.$route.params.contractAddress;
            this.tokenAddress = this.$route.params.tokenAddress;
            this.examination = new Examination(
                this.$management,
                this.contractAddress,
                this.tokenAddress
            );
            // イベントの購読
            this.examination.subscribeEvent(this.callBackFunc);

            // トークン情報の取得
            let promise0 = this.getTokenData();
            // 支払い状況の取得
            let promise1 = this.getPaymentStatus();
            // 患者の情報を取得
            let promise2 = this.getPatientInfo();
            // 簡易的な診療記録を取得
            let promise3 = this.getMedicalNotes();

            // 全てのプロミスを実行
            await Promise.all([promise0, promise1, promise2, promise3]);

            // 診察/支払いが終了済みかチェック
            this.checkPaymentCompleted();

            this.$emit("loading", true);
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
            this.paidToHospital = paymentStatus[4];
            this.paidToPatient = paymentStatus[5];
        },
        async getTokenData() {
            this.tokenData = await this.examination.getTokenData();
        },
        async getMedicalNotes() {
            this.medicalNotes = await this.examination.getMedicalNotes();
        },
        async generateSignQRCode() {
            this.$emit("loading", true);
            await sleep(100);
            this.medicalCostSign = this.$management.signMessage(
                String(this.medicalCost)
            );
            this.$emit("loading", false);
        },
        amountAddSymbol(value) {
            return (
                String(
                    Number(value) / 10 ** Number(this.tokenData["decimals"])
                ) +
                " " +
                this.tokenData["symbol"]
            );
        },
        formatDate(timestamp) {
            let date = new Date(timestamp);
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let hour = date.getHours();
            let minute = date.getMinutes();
            let timezone = date.getTimezoneOffset();
            return (
                year +
                "/" +
                month +
                "/" +
                day +
                " " +
                hour +
                ":" +
                minute +
                " UTC" +
                timezone / 60
            );
        },
        checkPaymentCompleted() {
            if (
                this.unpaidCost == 0 &&
                this.isSignCompleted == true &&
                this.deposit == 0
            ) {
                this.isPaymentCompleted = true;
                this.$emit("loading", false);
            }
        },
        reset() {
            localStorage.clear();
            window.location.href = "/";
        },
        async callBackFunc(event, value) {
            this.$emit("loading", true);
            // 一瞬で変わると何が起こったか分からないロードを入れる
            await sleep(250);
            this.$emit("loading", false);
            console.log(event);
            console.log(value);
            if (event === "SetMedicalCost") {
                this.medicalCost = value["medicalCost"];
            }
            if (event === "SignMedicalCost") {
                this.isSignCompleted = value["signed"];
                this.$emit("loading", true);
                this.checkPaymentCompleted();
            }
            if (event === "WithDraw") {
                this.unpaidCost = value["unpaidCost"];
                this.paidToHospital = value["paidToHospital"];
                this.paidToPatient = value["paidToPatient"];
                this.deposit = 0;
                this.checkPaymentCompleted();
            }
            if (event === "Transfer") {
                this.deposit = Number(this.deposit) + Number(value["value"]);
            }
            if (event === "AddMedicalNote") {
                // イベントが発生してもaddMedicalNoteは終了してない、少し待つ
                await sleep(500);
                // TODO:getMedicalNotesを呼ばずにeventの引数を復号して表示するようにする
                await this.getMedicalNotes();
            }
        }
    },
    destroyed: function() {
        this.examination.unload();
    }
};
</script>
