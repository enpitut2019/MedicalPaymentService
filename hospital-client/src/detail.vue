<template>
    <div class="page">
        <div class="fullscreen" v-if="isCameraActive">
            <qrcode-stream @decode="signMedicalCost"></qrcode-stream>
        </div>
        <div v-else>
            <div class="container">
                <div class="containerTitle">
                    <h1>ステータス</h1>
                </div>
                <div class="list">
                    <dl>
                        <dt>請求金額</dt>
                        <dd>{{ amountAddSymbol(medicalCost) }}</dd>
                        <dt>未収金金額</dt>
                        <dd v-if="!isSignCompleted">---</dd>
                        <dd v-if="isSignCompleted">
                            {{ amountAddSymbol(unpaidCost) }}
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
                <div style="text-align: center">
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
                        <dd>{{ amountAddSymbol(deposit) }}</dd>
                    </span>
                    </dl>
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
                        <dt>その他</dt>
                        <dd>リストで下にばーっと</dd>
                    </dl>
                </div>
            </div>
            <div class="container">
                <div class="containerTitle">
                    <h1>簡易的な診療記録</h1>
                    <div style="margin-top: 10px">
                        <ui-textbox
                                icon="edit"
                                floating-label
                                label="診療記録"
                                v-model="medLog"
                        ></ui-textbox>
                    </div>
                    <div style=" text-align: center; margin-top: 5px">
                        <button
                                class="button b-detLog"
                                @click="addMedicalNote(medLog)"
                        >
                            記録する
                        </button>
                    </div>
                </div>
                <div class="list">
                    <dl>
                    <span v-for="(item, index) in medicalNotes" :key="index">
                        <dt>{{ Date(item.timestamp * 1000).toString() }}</dt>
                        <dd>{{ item.note }}</dd>
                    </span>
                    </dl>
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
                <ui-button @click="setMedicalCost">決定</ui-button>
            </ui-modal>
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
            tokenData: { decimals: "", symbol: "" },
            medicalCost: 0,
            deposit: 0,
            unpaidCost: 0,
            usedEther: 0,
            ethPrice: 0,
            isSignCompleted: false,
            patientAddress: "0x0",
            patientData: "",
            inputMedicalCost: "",
            isCameraActive: false,
            medicalNotes: false,
            medLog: ""
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
            // 支払い状況の取得
            let promise1 = this.getPaymentStatus();
            // 患者の情報を取得
            let promise2 = this.getPatientInfo();
            // トークン情報の取得
            let promise3 = this.getToeknData();
            // 手数料（使用したEther量）を取得
            let promise4 = this.getContractFee();
            // 簡易的な診療記録を取得
            let promise5 = this.getMedicalNotes();

            // 全てのプロミスを実行
            await Promise.all([
                promise1,
                promise2,
                promise3,
                promise4,
                promise5
            ]);

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
            this.closeModal("inputModal");
            this.$emit("loading", true);
            await this.examination.setMedicalCost(this.inputMedicalCost);
            this.$emit("loading", false);
        },
        async signMedicalCost(result) {
            this.isCameraActive = false;
            this.$emit("loading", true);
            await this.examination.signMedicalCost(
                this.medicalCost,
                result,
                this.patientAddress
            );
            this.$emit("loading", false);
        },
        async addMedicalNote(note) {
            await this.examination.addMedicalNote(note);
        },
        async getMedicalNotes() {
            let n = await this.examination.getMedicalNotes();
            this.medicalNotes = n.slice().reverse();
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
        async callBackFunc(event, value) {
            this.$emit("loading", true);
            console.log(event);
            console.log(value);
            if (event === "SetMedicalCost")
                this.medicalCost = value["medicalCost"];
            if (event === "WithDraw") {
                this.unpaidCost = value["unpaidCost"];
                this.deposit = 0;
            }
            if (event === "Transfer") {
                // 一瞬で変わると何が起こったか分からないロードを入れる
                await sleep(250);
                this.deposit = Number(this.deposit) + Number(value["value"]);
            }
            if (event === "AddMedicalNote") {
                // イベントが発生してもaddMedicalNoteは終了してない、少し待つ
                await sleep(500);
                // TODO:getMedicalNotesを呼ばずにeventの引数を復号して表示するようにする
                await this.getMedicalNotes();
            }
            this.$emit("loading", false);
            // js側でさらにwithdrawを呼ぶためロード再開
            if (event === "SignMedicalCost") {
                this.isSignCompleted = value["signed"];
                this.$emit("loading", true);
            }
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
