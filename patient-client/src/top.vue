<template>
    <div class="page">
        <div>
            <h1>How To Use</h1>
            <p>適当な文章</p>
            <p>
                getPastEventsでデプロイされたアドレスをキャッチしたらそれを勝手に読み込む
            </p>
        </div>
        <div class="qrCode">
            <p v-if="!outputData">QRCodeがここに表示される</p>
            <vue-qrcode
                v-if="outputData"
                :value="outputData"
                :options="{ width: 500 }"
            ></vue-qrcode>
        </div>
        <ui-button @click="$router.push({ name: 'input' })">
            患者情報の入力
        </ui-button>
        <ui-button @click="load('0x33571Ca9deC342c9cC14bBaC6d5C50517D2e2c24')">
            テスト用：発行後画面へ遷移（遷移後操作不可）
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
        // 過去のイベントを読み込み
        if (this.outputData) this.$emit("loading", true);
        await this.$management.getPastStartExaminationEvent();
        this.$emit("loading", false);
    },
    methods: {
        async load(contractAddress) {
            this.$emit("loading", true);
            this.$router.push({
                name: "detail",
                params: { address: contractAddress }
            });
        },
        callBackFunc(event, value) {
            if (value.patientAddress === this.$management.getAddress()) {
                this.load(value.contractAddress);
            }
        }
    },
    destroyed: function() {
        this.$management.unload();
    }
};
</script>
