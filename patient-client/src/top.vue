<template>
    <div class="page">
        <div>
            <ui-alert :dismissible="false" v-if="!outputData">
                {{ t("info_text0") }}
            </ui-alert>
            <ui-alert :dismissible="false" v-if="outputData">
                {{ t("info_text1") }}
            </ui-alert>
            <ui-alert type="warning" :dismissible="false" v-if="outputData">
                {{ t("info_text2") }}
            </ui-alert>
        </div>
        <div class="box">
            <span class="box-title">サービスの概要（要改稿）</span>
            <p>
                外国人旅行者が医療機関を受診した際に母国の親族が暗号通貨で支払いを行うことを想定したサービスです。
                電子カルテなど既存サービスとの共存を前提としています。
                暗号通貨を使う以外のメリットとしては、
            </p>
            <p>
                ①診療ごとに専用のアドレスを発行することによる病院側の管理コスト軽減
            </p>
            <p>
                ②前払い…支払い能力の確認
            </p>
            <p>
                ③言語の違いによって起こりうる伝達ミスを起因とするトラブルの客観的解決
            </p>
            <p>などが挙げられます。あああああああああああああああああああああああああああああああああああああああああああああ</p>
        </div>
        <div class="center">
            <vue-qrcode
                v-if="outputData"
                :value="outputData"
                :options="{
                    width: winodwWidth * 0.9,
                    color: { dark: '#000000ff', light: '#ffffff' }
                }"
            ></vue-qrcode>
            <button
                class="button button--large"
                @click="$router.push({ name: 'input' })"
            >
                <p v-if="!outputData">{{ t("button_text1") }}</p>
                <p v-if="outputData">{{ t("button_text2") }}</p>
            </button>
        </div>
    </div>
</template>

<script>
import VueQrcode from "@chenfengyuan/vue-qrcode";
export default {
    components: {
        VueQrcode
    },
    data() {
        return {
            outputData: "",
            winodwWidth: window.innerWidth
        };
    },
    locales: {
        en: {
            button_text1: "Enter Your Information",
            button_text2: "Edit Your Information",
            info_text0: "1. Enter/Edit your information from the below button.",
            info_text1: "3. Show this QR code at the hospital.",
            info_text2:
                "Do not share this QR code on the Internet because it contains personal information!"
        },
        ja: {
            button_text1: "受付情報の入力",
            button_text2: "入力した情報の修正",
            info_text0: "1. 下のボタンからあなたの情報を入力/編集してください",
            info_text1: "3. 病院でQRコードを提示してください",
            info_text2:
                "このQRコードは個人情報を含むため、インターネットで公開しないでください!"
        },
        ru: {
            button_text1: "Введите информацию о приеме",
            button_text2: "Исправьте введенную информацию",
            info_text0:
                "1. Введите/отредактируйте информацию с помощью кнопки ниже",
            info_text1: "3. Пожалуйста, покажите QR-код в больнице!",
            info_text2:
                "Не публикуйте этот QR-код в Интернете, поскольку он содержит личную информацию.!"
        }
    },
    mounted: async function() {
        this.$management.subscribeEvent(this.callBackFunc);
        this.outputData = localStorage.getItem("qrCodeData");
        if (this.outputData) this.$emit("loading", true);
        // 過去のイベントを読み込み
        await this.$management.getPastStartExaminationEvent();
        this.$emit("loading", false);
    },
    methods: {
        async load(contractAddress, tokenAddress) {
            this.$emit("loading", true);
            this.$router.push({
                name: "detail",
                params: {
                    contractAddress: contractAddress,
                    tokenAddress: tokenAddress
                }
            });
        },
        callBackFunc(event, value) {
            this.load(value.contractAddress, value.tokenAddress);
        }
    },
    destroyed: function() {
        this.$management.unload();
    }
};
</script>
