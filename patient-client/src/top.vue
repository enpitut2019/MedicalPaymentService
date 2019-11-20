<template>
    <div class="page">
        <div class="center">
            <p v-if="outputData">Please show a hospital this QR code!</p>
            <p v-if="!outputData">QR code will be displayed here!</p>
            <p v-if="!outputData">Please register your information!</p>
        </div>
        <div class="qrCode">
            <vue-qrcode
                v-if="outputData"
                :value="outputData"
                :options="{ width: 500, color: {dark: '#000000ff', light: '#f5f5dc'} }"
            ></vue-qrcode>
        </div>
        <ui-button v-if="!outputData" @click="$router.push({ name: 'input' })">
            Register Your Information
        </ui-button>
        <ui-button v-if="outputData" @click="$router.push({ name: 'input' })">
            Edit Your Information
        </ui-button>
        <ui-button
            @click="
                load(
                    '0x9b46bdb6F5371979Da96e359Bd8fb7862Aa948F9',
                    '0xBF8AC0D55453C6d240273404c11FfBbD33E65aF7'
                )
            "
            >テスト用：発行後画面へ遷移
        </ui-button>
    </div>
</template>

<script>
const yesOrNo = [
    {
        label: "YES",
        value: "yes"
    },
    {
        label: "NO",
        value: "no"
    }
];

import VueQrcode from "@chenfengyuan/vue-qrcode";
export default {
    components: {
        VueQrcode
    },
    data() {
        return {
            inputName: "",
            inputAge: "",
            inputBloodTransfusion: "",
            outputData: "",
            options: {
                yesOrNo
            }
        };
    },
    mounted: async function() {
        this.$management.subscribeEvent(this.callBackFunc);
        this.outputData = localStorage.getItem("qrCodeData");
        console.log(this.outputData);
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
