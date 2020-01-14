<template>
    <div class="page">
        <ui-alert
            type="success"
            :dismissible="false"
            v-show="isPaymentCompleted"
        >
            患者から{{ amountAddSymbol(paidToHospital) }}受け取り、{{
                amountAddSymbol(paidToPatient)
            }}返金しました<br />
            また、Blockchainの利用手数料として{{ contractFee }}支払いました
        </ui-alert>
        <ui-alert type="error" v-show="signError" @dismiss="signError = false">
            読み取るQRコードが違います
        </ui-alert>
        <div v-if="isCameraActive" style="text-align: center; width: 100%">
            <qrcode-stream class="fullscreen" @decode="signMedicalCost">
                <div v-if="isCameraActive">
                    <div class="com-note">
                        患者の決済用QRコードを読み取ってください。
                        <button @click="isCameraActive = false">
                            キャンセル
                        </button>
                    </div>
                </div>
            </qrcode-stream>
        </div>
        <div v-if="!isCameraActive">
            <div class="container">
                <div class="containerTitle">
                    <h1>ステータス</h1>
                </div>
                <div class="list">
                    <dl>
                        <dt>専用アドレス</dt>
                        <dd>{{ contractAddress }}</dd>
                        <dt>入金済み金額</dt>
                        <dd>{{ amountAddSymbol(deposit) }}</dd>
                        <dt>医療費</dt>
                        <dd>{{ amountAddSymbol(medicalCost) }}</dd>
                        <dt>未収金</dt>
                        <dd v-if="!isSignCompleted">---</dd>
                        <dd v-if="isSignCompleted">
                            {{ amountAddSymbol(unpaidCost) }}
                        </dd>
                    </dl>
                </div>
                <div class="other" v-if="!isSignCompleted">
                    <ui-textbox
                        icon="attach_money"
                        v-model="inputMedicalCost"
                        placeholder="医療費（単位USD/小数点可）"
                    ></ui-textbox>
                </div>
                <div class="center" v-if="!isSignCompleted">
                    <button class="button button--wide" @click="setMedicalCost">
                        医療費を登録
                    </button>
                    <div class="blank"></div>
                    <button
                        class="button button--wide"
                        @click="isCameraActive = true"
                    >
                        決済
                    </button>
                </div>
            </div>
            <div class="container">
                <div class="containerTitle">
                    <h1>簡易的な診療記録</h1>
                </div>
                <div class="list">
                    <dl>
                        <span
                            v-for="(item, index) in medicalNotes"
                            :key="index"
                        >
                            <dt>
                                {{ formatDate(item.timestamp * 1000) }}
                            </dt>
                            <dd>{{ item.note }}</dd>
                        </span>
                    </dl>
                </div>
                <div class="other" v-if="!isSignCompleted">
                    <ui-textbox
                        icon="edit"
                        placeholder="診療記録"
                        v-model="medLog"
                    ></ui-textbox>
                </div>
                <div class="center" v-if="!isSignCompleted">
                    <button
                        class="button button--wide"
                        @click="
                            addMedicalNote(medLog);
                            medLog = '';
                        "
                    >
                        記録する
                    </button>
                </div>
            </div>
            <div class="container">
                <div class="containerTitle">
                    <h1>患者の情報</h1>
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
        </div>
    </div>
</template>

<script>
import Examination from "./examination.js";
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

export default {
    data: function() {
        return {
            examination: "",
            contractAddress: "0x0",
            tokenData: {},
            medicalCost: 0,
            deposit: 0,
            unpaidCost: 0,
            isSignCompleted: false,
            patientAddress: "0x0",
            patientData: "",
            inputMedicalCost: "",
            isCameraActive: false,
            medicalNotes: false,
            medLog: "",
            paidToHospital: 0,
            paidToPatient: 0,
            contractFee: 0,
            isPaymentCompleted: false,
            signError: false
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
            let tokenAddress = this.$route.params.tokenAddress;
            this.examination = new Examination(
                this.$management,
                this.contractAddress,
                tokenAddress
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

            // 診察が終了済みでデポジットがあれば決済
            if (this.isSignCompleted && this.deposit > 0) await this.withDraw();

            this.$emit("loading", false);
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
        async getContractFee() {
            let usedEther = await this.examination.getUsedEther();
            // CoinGeckoのAPIを使用して現在のEther価格を取得
            let coinGeckoApiResult = await (await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=jpy&ids=ethereum"
            )).json();
            let ethPrice = coinGeckoApiResult[0].current_price;
            return (
                usedEther + "ETH (約" + Math.ceil(usedEther * ethPrice) + "JPY)"
            );
        },
        async setMedicalCost() {
            this.$emit("loading", true);
            await this.examination.setMedicalCost(this.inputMedicalCost);
            this.inputMedicalCost = "";
            this.$emit("loading", false);
        },
        async signMedicalCost(result) {
            this.isCameraActive = false;
            // アドレスのQRコードを読み込んだ場合は無視
            if (this.$management.isAddress(result)) {
                this.signError = true;
                return;
            }
            this.signError = false;
            this.$emit("loading", true);
            await this.examination.signMedicalCost(
                this.medicalCost,
                result,
                this.patientAddress
            );
            if (this.isSignCompleted && this.deposit > 0) await this.withDraw();
        },
        async addMedicalNote(note) {
            this.$emit("loading", true);
            await this.examination.addMedicalNote(note);
            this.$emit("loading", false);
        },
        async getMedicalNotes() {
            this.medicalNotes = await this.examination.getMedicalNotes();
        },
        async withDraw() {
            console.log("withDraw");
            this.$emit("loading", true);
            await this.examination.withDraw();
            this.$emit("loading", false);
        },
        /** 小数点の位置をずらしてシンボルを付加
         *  Ex. 123400000000000000000 -> 123.4 SYMBOL
         */
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
        async checkPaymentCompleted() {
            if (
                this.unpaidCost == 0 &&
                this.isSignCompleted == true &&
                this.deposit == 0
            ) {
                this.contractFee = await this.getContractFee();
                this.isPaymentCompleted = true;
                this.$emit("loading", false);
            }
        },
        async callBackFunc(event, value) {
            this.$emit("loading", false);
            console.log(event);
            console.log(value);
            if (event === "SetMedicalCost")
                this.medicalCost = value["medicalCost"];
            if (event === "WithDraw") {
                this.unpaidCost = value["unpaidCost"];
                this.paidToHospital = value["paidToHospital"];
                this.paidToPatient = value["paidToPatient"];
                this.deposit = 0;
                this.checkPaymentCompleted();
            }
            if (event === "AddMedicalNote") {
                // イベントが発生してもaddMedicalNoteは終了してない、少し待つ
                await sleep(500);
                // TODO:getMedicalNotesを呼ばずにeventの引数を復号して表示するようにする
                await this.getMedicalNotes();
            }
            if (event === "SignMedicalCost") {
                this.unpaidCost = this.medicalCost;
                this.isSignCompleted = value["signed"];
                this.$emit("loading", true);
                this.checkPaymentCompleted();
            }
            if (event === "Transfer") {
                this.$emit("loading", true);
                await sleep(250);
                this.deposit = Number(this.deposit) + Number(value["value"]);
                if (this.isSignCompleted) await this.withDraw();
                this.$emit("loading", false);
            }
        }
    },
    destroyed: function() {
        this.examination.unload();
    }
};
</script>
