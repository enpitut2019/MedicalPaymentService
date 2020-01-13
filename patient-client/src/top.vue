<template>
    <div class="page">
        <div>
            <ui-alert>
                デモ用メッセージ：右上のボタンから言語の変更ができます（日本語→英語→ロシア語→日本語…）
            </ui-alert>
            <h2 v-if="!outputData">エレベータピッチ的なことを書く</h2>
            <ui-alert :dismissible="false" v-if="outputData">
                {{ t("info_text1") }}
            </ui-alert>
            <ui-alert type="warning" :dismissible="false" v-if="outputData">
                {{ t("info_text2") }}
            </ui-alert>
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
            info_text1: "Show this QR code at the hospital!",
            info_text2:
                "Do not share this QR code on the Internet because it contains personal information!"
        },
        ja: {
            button_text1: "受付情報の入力",
            button_text2: "入力した情報の修正",
            info_text1: "病院でQRコードを提示してください!",
            info_text2:
                "このQRコードは個人情報を含むため、インターネットで公開しないでください!"
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
