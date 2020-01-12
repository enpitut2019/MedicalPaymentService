<template>
    <div class="page center">
        <div>
            <h2 v-if="!outputData">エレベータピッチ的なことを書く</h2>
            <h2 v-if="outputData">
                Show this QR code at the hospital! <br />
                病院でQRコードを提示してください!
            </h2>
            <p v-if="outputData">
                Do not share this QR code because it contains personal
                information<br />
                このQRコードは個人情報を含むため、公開しないでください<br />
                TODO:英語<br />
                入力された情報は病院での受付時ブロックチェーン上に格納されます
                暗号化していますが、 真の情報は入力しないでください
            </p>
            <h2 v-if="!outputData"></h2>
        </div>
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
