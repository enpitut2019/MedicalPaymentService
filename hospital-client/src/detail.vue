<template>
    <div class="page">
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
            <ui-alert :dismissible="false" v-if="!isSignCompleted">
                3. 患者の入金済み金額を確認してください /
                医療費を登録してください /
                現実世界で診療等を行ってください（順不同）
            </ui-alert>
            <ui-alert :dismissible="false" v-if="!isSignCompleted">
                4.
                医療費に関して患者の了承が得られれば「医療費を確定」ボタンを押しQRコードを読み取ってください
                医療費の確定後、自動で決済が行われます
            </ui-alert>
            <ui-alert
                type="warning"
                :dismissible="false"
                v-if="isSignCompleted && !isPaymentCompleted && deposit == 0"
            >
                5.支払金額が不足しています！
                追加で送金を行うよう要求してください
            </ui-alert>
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
            <ui-alert
                type="error"
                v-show="signError"
                @dismiss="signError = false"
            >
                異なるQRコードを読み込んでいます！
            </ui-alert>
            <ui-alert
                type="error"
                v-show="somethingError"
                @dismiss="somethingError = false"
            >
                デモ用に秘密鍵を共有してるため、操作が衝突してる可能性があります。30秒程度空けてから再度操作するか、それでもエラーが表示される場合ページを更新してください。
            </ui-alert>
            <div class="container">
                <div class="containerTitle">
                    <h1>ステータス</h1>
                </div>
                <div class="list">
                    <dl>
                        <dt>医療費</dt>
                        <dd>{{ amountAddSymbol(medicalCost) }}</dd>
                        <dt>入金済み金額</dt>
                        <dd>{{ amountAddSymbol(deposit) }}</dd>
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
                        医療費を確定
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
                    <button class="button button--wide" @click="addMedicalNote">
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
                        <dt>専用アドレス</dt>
                        <dd>{{ contractAddress }}</dd>
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
            signError: false,
            somethingError: false
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
            let tmp = this.inputMedicalCost;
            this.inputMedicalCost = "";
            // 数字以外の入力弾く
            if (isFinite(tmp) && tmp !== "") {
                try {
                    this.somethingError = false;
                    await this.examination.setMedicalCost(tmp);
                } catch (e) {
                    this.somethingError = true;
                }
            }
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
            try {
                await this.examination.signMedicalCost(
                    this.medicalCost,
                    result,
                    this.patientAddress
                );
            } catch (e) {
                this.signError = true;
            }
            if (this.isSignCompleted && this.deposit > 0) await this.withDraw();
            else this.$emit("loading", false);
        },
        async addMedicalNote() {
            this.$emit("loading", true);
            let tmp = this.medLog;
            this.medLog = "";
            // 空文字列を弾く
            if (tmp !== "") {
                try {
                    this.somethingError = false;
                    await this.examination.addMedicalNote(tmp);
                } catch (e) {
                    this.somethingError = true;
                }
            }
            this.$emit("loading", false);
        },
        async getMedicalNotes() {
            this.medicalNotes = await this.examination.getMedicalNotes();
        },
        async withDraw() {
            this.$emit("loading", true);
            try {
                this.somethingError = false;
                await this.examination.withDraw();
            } catch (e) {
                this.somethingError = true;
            }
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
                -(timezone / 60)
            );
        },
        async checkPaymentCompleted() {
            if (
                this.unpaidCost == 0 &&
                this.isSignCompleted == true &&
                this.deposit == 0
            ) {
                this.isPaymentCompleted = true;
                this.contractFee = await this.getContractFee();
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
                this.medicalNotes.push(value);
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
        this.$emit("loading", false);
    }
};
</script>
