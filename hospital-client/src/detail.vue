<template>
    <div>
        <div class="backbutton" @click="back">
            <span></span>
        </div>
        <div class="fullscreen" v-if="isCameraActive">
            <qrcode-stream @decode="signMedicalCost"></qrcode-stream>
        </div>
        <div class="page">
            <div class="container">
                <div class="containerTitle">
                    <h1>ステータス</h1>
                </div>
                <div class="list">
                    <dl>
                        <dt>請求金額</dt>
                        <dd>
                            {{ medicalCost / 10 ** this.tokenData["decimals"] }}
                            {{ tokenData["symbol"] }}
                        </dd>
                        <dt>未収金金額</dt>
                        <dd v-if="!isSignCompleted">---</dd>
                        <dd v-if="isSignCompleted">
                            {{ unpaidCost / 10 ** this.tokenData["decimals"] }}
                            {{ tokenData["symbol"] }}
                        </dd>
                        <dt>発生した手数料</dt>
                        <dd>
                            {{ Math.ceil(usedEther * ethPrice) }} JPY ({{
                                usedEther
                            }}
                            ETH)
                        </dd>
                    </dl>
                </div>
                <ui-button
                    @click="openModal('inputModal')"
                    v-if="!isSignCompleted"
                    >医療費を入力</ui-button
                >
                <ui-button
                    @click="isCameraActive = true"
                    v-if="!isSignCompleted"
                    >医療費を確定（QRコード読み込み）</ui-button
                >
            </div>
            <div class="container">
                <div class="containerTitle">
                    <h1>デポジット情報</h1>
                </div>
                <div class="list">
                    <dl>
                        <span>
                            <dt>デポジット先アドレス</dt>
                            <dd>{{ contractAddress }}</dd>
                        </span>
                        <span>
                            <dt>デポジット金額</dt>
                            <dd>
                                {{ deposit / 10 ** this.tokenData["decimals"] }}
                                {{ tokenData["symbol"] }}
                            </dd>
                        </span>
                    </dl>
                </div>
                <ui-button @click="withDraw" :disabled="!isSignCompleted"
                    >引き出し（医療費確定後）</ui-button
                >
                <ui-button @click="refund" :disabled="!isSignCompleted"
                    >返金（医療費確定後）</ui-button
                >
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
                        <dt>その他</dt>
                        <dd>リストで下にばーっと</dd>
                    </dl>
                </div>
            </div>
        </div>
        <ui-modal ref="inputModal" transition="scale-up">
            <div slot="header">
                <b>医療費の入力</b>
            </div>
            <ui-textbox
                v-model="inputMedicalCost"
                label="Medical Cost"
            ></ui-textbox>
            <ui-button @click="setMedicalCost">登録</ui-button>
        </ui-modal>
    </div>
</template>

<script>
import Examination from "./examination.js";

export default {
    data: function() {
        return {
            examination: "",
            contractAddress: "0x0",
            tokenData: { decimals: "" },
            medicalCost: 0,
            deposit: 0,
            unpaidCost: 0,
            usedEther: 0,
            ethPrice: 0,
            isSignCompleted: false,
            patientAddress: "0x0",
            patientData: "",
            inputMedicalCost: "",
            isCameraActive: false
        };
    },
    methods: {
        async init() {
            // TODO 画面ぐるぐる
            console.log("画面ぐるぐる開始");
            const sleep = msec =>
                new Promise(resolve => setTimeout(resolve, msec));
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
            // 手数料（使用したEther量）を取得
            let promise4 = this.getContractFee();

            // 全てのプロミスを実行
            await Promise.all([promise1, promise2, promise3, promise4]);
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
        async getContractFee() {
            this.usedEther = await this.examination.getUsedEther();
            // CoinGeckoのAPIを使用して現在のEther価格を取得
            let coinGeckoApiResult = await (await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=jpy&ids=ethereum"
            )).json();
            this.ethPrice = coinGeckoApiResult[0].current_price;
        },
        async setMedicalCost() {
            closeModal("inputModal");
            await this.examination.setMedicalCost(this.inputMedicalCost);
        },
        async signMedicalCost(result) {
            await this.examination.signMedicalCost(
                this.medicalCost,
                result,
                this.patientAddress
            );
        },
        async withDraw() {
            await this.examination.withDraw();
        },
        async refund() {
            await this.examination.refund();
        },
        callBackFunc(event, value) {
            console.log(event);
            console.log(value);
            if (event === "SetMedicalCost")
                this.medicalCost = value["medicalCost"];
            if (event === "SignMedicalCost")
                this.isSignCompleted = value["signed"];
            if (event === "WithDraw") this.unpaidCost = value["unpaidCost"];
            if (event === "Refund") console.log("Refund" + value["amount"]);
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
    created: function() {
        this.init();
    },
    destroyed: function() {
        this.examination.unload();
    }
};
</script>

<style scoped>
/*============================================
アニメーション
============================================*/

.v-enter {
    opacity: 0;
    transform: translateY(100%);
}
.v-enter-to {
    opacity: 1;
}
.v-enter-active {
    transition: opacity 300ms ease-out, transform 300ms ease-out;
}
.v-leave {
    opacity: 1;
}
.v-leave-to {
    opacity: 0;
    transform: translateY(100%);
}
.v-leave-active {
    transition: opacity 270ms ease-out, transform 270ms ease-out;
}
</style>
