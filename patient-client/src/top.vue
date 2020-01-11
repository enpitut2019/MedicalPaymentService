<template>
    <div class="page center">
        <div>
            <p v-if="outputData">Please show a hospital this QR code!</p>
            <p v-if="!outputData">QR code will be displayed here!</p>
            <p v-if="!outputData">Please register your information!</p>
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
            <p v-if="!outputData">Register Your Information</p>
            <p v-if="outputData">Edit Your Information</p>
        </button>
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
            },
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
