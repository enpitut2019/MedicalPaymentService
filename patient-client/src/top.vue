<template>
    <div class="page">
        <div>
            <h2 v-if="!outputData">エレベータピッチ的なことを書く</h2>
            <ui-alert :dismissible="false" v-if="outputData">
                Show this QR code at the hospital! /
                病院でQRコードを提示してください!</ui-alert
            >
            <ui-alert type="warning" :dismissible="false" v-if="outputData">
                Do not share this QR code on the Internet because it contains
                personal information! /
                このQRコードは個人情報を含むため、インターネットで公開しないでください!
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
                <p v-if="!outputData">Enter Your Information</p>
                <p v-if="outputData">Edit Your Information</p>
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
