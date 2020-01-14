<template>
    <div class="page">
        <h2>エレベータピッチ的なことを書く</h2>
        <div class="center">
            <div v-if="!isCameraActive">
                <button
                    @click="isCameraActive = true"
                    class="button button--large"
                >
                    QRコードを読み込む
                </button>
            </div>
            <div v-if="isCameraActive">
                <qrcode-stream class="fullscreen" @decode="inputData">
                    <div v-if="isCameraActive">
                        <div class="com-note">
                            患者の受付用QRコードを読み取ってください。
                            <button @click="isCameraActive = false">
                                キャンセル
                            </button>
                        </div>
                    </div>
                </qrcode-stream>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            isCameraActive: false,
            patientDataActive: false,
            encryptedPatientData: "",
            patientSign: "",
            patientPassPhrase: "",
            patientData: ""
        };
    },
    methods: {
        inputData(result) {
            // 入力がEthereumのAddressだった場合
            if (this.$management.isAddress(result)) {
                this.load(result, "0xBF8AC0D55453C6d240273404c11FfBbD33E65aF7");
                return;
            }
            // TODO:入力チェック
            let sourceArray = result.split(",");
            this.patientPassPhrase = sourceArray[0];
            this.encryptedPatientData = sourceArray[1];
            this.patientSign = sourceArray[2];
            // 復号
            let patientDataJson = this.$management.decrypt(
                this.encryptedPatientData,
                this.patientPassPhrase
            );
            this.patientData = JSON.parse(patientDataJson);
            this.patientDataActive = true;
            this.isCameraActive = false;

            this.$router.push({
                name: "confirmation",
                params: {
                    patientData: this.patientData,
                    patientSign: this.patientSign,
                    patientPassPhrase: this.patientPassPhrase,
                    encryptedPatientData: this.encryptedPatientData
                }
            });
        },
        async load(contractAddress, tokenAddress) {
            this.$emit("loading", true);
            this.$router.push({
                name: "detail",
                params: {
                    contractAddress: contractAddress,
                    tokenAddress: tokenAddress
                }
            });
        }
    }
};
</script>
