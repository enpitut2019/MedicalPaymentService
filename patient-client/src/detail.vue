<template>
    <div class="page">
        <ui-button @click="testMethod">テスト用：秘密鍵リセット </ui-button>
        <div class="container">
            <div class="containerTitle">
                <h1>Contract Information</h1>
            </div>
            <div class="list">
                <dl>
                    <dt>Medical Cost</dt>
                    <dd>{{ amountAddSymbol(medicalCost) }}</dd>
                    <dt>Unpaid Medical Cost</dt>
                    <dd v-if="!isSignCompleted">---</dd>
                    <dd v-if="isSignCompleted">
                        {{ amountAddSymbol(unpaidCost) }}
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
                        <dd>
                            <ui-button
                                @click="clipboardAlert"
                                class="copy-btn"
                                data-clipboard-action="copy"
                                data-clipboard-target="#foo"
                            >
                                copy address</ui-button
                            >
                        </dd>
                        <dt>Deposit Value</dt>
                        <dd>{{ amountAddSymbol(deposit) }}</dd>
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
                <h1>簡易的な診療記録</h1>
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
        <ui-modal ref="QRCodeModal" transition="scale-up">
            <div slot="header">
                <b>Show QRCode to Hospital</b>
            </div>
            <div class="popupQrCode">
                <vue-qrcode
                    v-if="medicalCostSign"
                    :value="medicalCostSign"
                    :options="{ width: 500 }"
                ></vue-qrcode>
            </div>
        </ui-modal>
        <div id="foo">{{ contractAddress }}</div>
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
            medicalCostSign: "",
            medicalNotes: false
        };
    },
    beforeCreate: async function() {
        // clipboard.js の読み込み
        let recaptchaScript = document.createElement("script");
        recaptchaScript.setAttribute(
            "src",
            "https://unpkg.com/clipboard@2/dist/clipboard.min.js"
        );
        document.head.appendChild(recaptchaScript);
    },
    created: async function() {
        this.$emit("loading", true);
        await sleep(1000);
        await this.init();
        this.$emit("loading", false);
        // clipboard.js の初期化
        new ClipboardJS(".copy-btn");
    },
    watch: {
        isSignCompleted: function() {
            if (this.unpaidCost == 0) {
                this.$router.push("/settlement");
                this.$router.push({
                    name: 'settlement',
                    params: {
                    contractAddress: contractAddress,
                    tokenAddress: tokenAddress
                    }
                });
            };
        },
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
            // 簡易的な診療記録を取得
            let promise4 = this.getMedicalNotes();

            // 全てのプロミスを実行
            await Promise.all([promise1, promise2, promise3, promise4]);

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
        },
        async getToeknData() {
            this.tokenData = await this.examination.getTokenData();
        },
        async getMedicalNotes() {
            this.medicalNotes = await this.examination.getMedicalNotes();
        },
        generateSignQRCode() {
            this.medicalCostSign = this.$management.signMessage(
                String(this.medicalCost)
            );
            this.openModal("QRCodeModal");
        },
        clipboardAlert() {
            alert("アドレスをコピーできました！" + this.contractAddress);
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
            // 一瞬で変わると何が起こったか分からないロードを入れる
            await sleep(250);
            console.log(event);
            console.log(value);
            if (event === "SetMedicalCost") {
                this.medicalCost = value["medicalCost"];
            }
            if (event === "SignMedicalCost") {
                this.isSignCompleted = value["signed"];
            }
            if (event === "WithDraw") {
                this.unpaidCost = value["unpaidCost"];
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
        },
        testMethod() {
            localStorage.clear();
            window.location.href = "/";
        }
    },
    destroyed: function() {
        this.examination.unload();
    }
};
</script>
