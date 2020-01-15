<template>
    <div class="page">
        <ui-alert :dismissible="false" v-if="!isSignCompleted">
            {{ t("process3_info_text0") }}
        </ui-alert>
        <ui-alert :dismissible="false" v-if="!isSignCompleted">
            {{ t("process4_info_text0") }}
        </ui-alert>
        <ui-alert
            type="warning"
            :dismissible="false"
            v-if="isSignCompleted && !isPaymentCompleted && deposit === 0"
        >
            {{ t("process5_info_text0") }}
        </ui-alert>
        <ui-alert
            type="success"
            :dismissible="false"
            v-show="isPaymentCompleted"
        >
            <!-- パラメータ入れられなかったので1文を分割 -->
            {{ t("success_info_part1") }}{{ amountAddSymbol(paidToHospital)
            }}{{ t("success_info_part2") }}{{ amountAddSymbol(paidToPatient)
            }}{{ t("success_info_part3") }}
        </ui-alert>
        <ui-alert
            type="warning"
            :dismissible="false"
            v-show="isPaymentCompleted"
        >
            <!-- パラメータ入れられなかったので1文を分割 -->
            {{ t("privateKey_info_part1") }}{{ privateKey
            }}{{ t("privateKey_info_part2") }}
        </ui-alert>
        <div class="container">
            <div class="containerTitle">
                <h1>{{ t("payment_information") }}</h1>
            </div>
            <div class="list">
                <dl>
                    <dt>{{ t("medical_cost") }}</dt>
                    <dd>{{ amountAddSymbol(medicalCost) }}</dd>
                    <dt>{{ t("deposit_value") }}</dt>
                    <dd>{{ amountAddSymbol(deposit) }}</dd>
                    <dt>{{ t("unpaid_medical_cost") }}</dt>
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
                    :options="{ width: winodwWidth * 0.85 }"
                ></vue-qrcode>
                <button class="button button--wide" @click="generateSignQRCode">
                    {{ t("agree") }}
                </button>
            </div>
        </div>
        <div class="container">
            <div class="containerTitle">
                <h1>{{ t("medical_records") }}</h1>
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
                <h1>{{ t("examination_address") }}</h1>
            </div>
            <div class="center">
                <vue-qrcode
                    :value="contractAddress"
                    :options="{ width: winodwWidth * 0.85 }"
                ></vue-qrcode>
            </div>
        </div>
        <div class="center" v-if="isPaymentCompleted">
            <button class="button button--wide" @click="reset">
                {{ t("exit_button_text") }}
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
            tokenData: {},
            medicalCost: 0,
            deposit: 0,
            unpaidCost: 0,
            isSignCompleted: false,
            medicalCostSign: "",
            medicalNotes: false,
            winodwWidth: window.innerWidth,
            isPaymentCompleted: false,
            paidToHospital: 0,
            paidToPatient: 0,
            privateKey: localStorage.getItem("patientPrivateKey")
        };
    },
    locales: {
        en: {
            process3_info_text0:
                "4. Transfer the specified cryptocurrency using QR code at the bottom of the page (we have a transference client for the demo)",
            process4_info_text0:
                "5. If you accept the displayed medical expenses, please press the 'Agree to Medical Cost' button and show the displayed QR code",
            process5_info_text0:
                "6. Out of payment amount! Please transfer additionally",
            success_info_part1: "Paid ",
            success_info_part2: " to medical institution and ",
            success_info_part3: " refunded!",
            privateKey_info_part1:
                'In order to receive the refund, you need to import the private key "',
            privateKey_info_part2: '" into any wallet.',
            payment_information: "Payment Information",
            deposit_value: "Depost Value",
            medical_cost: "Medical Cost",
            unpaid_medical_cost: "Unpaid Medical Cost",
            agree: "Agree to Medical Cost",
            medical_records: "Simple Medical Records",
            examination_address: "Transferring Address",
            exit_button_text: "Completed (after privatekey import)"
        },
        ja: {
            process3_info_text0:
                "4. ページ下部のQRコード宛に指定された暗号通貨を送金してください（デモ用に送金専用のクライアントを用意してあります）",
            process4_info_text0:
                "5. 表示された医療費に了承した場合「医療費に同意」ボタンを押し、表示されたQRコードを提示してください",
            process5_info_text0:
                "6. 支払金額が不足しています！追加で送金を行ってください",
            success_info_part1: "医療機関に",
            success_info_part2: "支払い、",
            success_info_part3: "返金されました",
            privateKey_info_part1:
                "返金を受け取るためには任意のウォレットで秘密鍵「",
            privateKey_info_part2: "」をインポートする必要があります",
            payment_information: "支払い情報",
            deposit_value: "入金済み金額",
            medical_cost: "医療費",
            unpaid_medical_cost: "未払い金額",
            agree: "医療費に同意",
            medical_records: "簡易的な診療記録",
            examination_address: "送金先アドレス",
            exit_button_text: "完了（秘密鍵のインポート後）"
        },
        ru: {
            process3_info_text0:
                "4. Пожалуйста, отправьте указанную криптовалюту в QR-код внизу страницы (у нас есть специальный клиент для перевода)",
            process4_info_text0:
                "5. Если вы принимаете отображаемые медицинские расходы, нажмите кнопку «Я согласен на медицинские расходы» и покажите отображаемый QR-код.",
            process5_info_text0:
                "6. Из суммы платежа! Пожалуйста, перешлите на QR-код внизу страницы дополнительно",
            success_info_part1: "выплачено ",
            success_info_part2: " в медицинское учреждение, ",
            success_info_part3: " возврат",
            privateKey_info_part1:
                'Чтобы получить возмещение, вам необходимо импортировать закрытый ключ "',
            privateKey_info_part2: "с любым кошельком.",
            payment_information: "Информация об оплате",
            deposit_value: "Сумма депозита",
            medical_cost: "Медицинские расходы",
            unpaid_medical_cost: "Сумма к оплате",
            agree: "Я согласен с медицинскими расходами",
            medical_records: "Простые медицинские записи",
            examination_address: "Адрес Передачи",
            exit_button_text: "Завершено (после импорта закрытого ключа)"
        }
    },
    created: async function() {
        this.$emit("loading", true);
        await sleep(1000);
        await this.init();
        this.$emit("loading", false);
    },
    mounted: function() {
        window.addEventListener("resize", this.handleResize);
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
            // 簡易的な診療記録を取得
            let promise2 = this.getMedicalNotes();

            // 全てのプロミスを実行
            await Promise.all([promise0, promise1, promise2]);

            // 診察/支払いが終了済みかチェック
            this.checkPaymentCompleted();

            this.$emit("loading", true);
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
            let timezone = -date.getTimezoneOffset() / 60;
            if (timezone > 0) timezone = "+" + timezone;
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
                timezone
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
            window.location.reload();
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
                this.unpaidCost = this.medicalCost;
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
                this.medicalNotes.push(value);
            }
        },
        handleResize: function() {
            this.winodwWidth = window.innerWidth;
        }
    },
    destroyed: function() {
        window.removeEventListener("resize", this.handleResize);
        this.examination.unload();
        this.$emit("loading", false);
    }
};
</script>
