<template>
    <div>
        <div class="header">
            <img src="./testlogo.png" />
            <p>TODO:ロゴをちゃんとしたものに差し替える</p>
        </div>
        <div class="page">
            <div>
                <h1>How To Use</h1>
                <p>適当な文章</p>
                <p>
                    getPastEventsでデプロイされたアドレスをキャッチしたらそれを勝手に読み込む
                </p>
            </div>
            <ui-button @click="$router.push({ name: 'input' })"
                >患者情報の入力</ui-button
            >
            <div class="qrCode">
                <p v-if="!outputData">QRCodeがここに表示される</p>
                <vue-qrcode
                    v-if="outputData"
                    :value="outputData"
                    :options="{ width: 500 }"
                ></vue-qrcode>
            </div>
            <ui-button
                @click="load('0xFA8AFb171e3793763CF7a8A4FF47A98edFfC759A')"
                >テスト用：発行後画面へ遷移</ui-button
            >
        </div>
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
    methods: {
        async load(contractAddress) {
            // DetailページをPush
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
    mounted: function() {
        this.$management.subscribeEvent(this.callBackFunc);
        this.outputData = localStorage.getItem("qrCodeData");
    },
    destroyed: function() {
        this.$management.unload();
    }
};
</script>
