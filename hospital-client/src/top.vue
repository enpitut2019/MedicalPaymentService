<template>
    <div class="page">
        <div v-if="isCameraActive" style="text-align: center; width: 100%">
            <qrcode-stream class="fullscreen" @decode="inputData">

                <div v-if="isCameraActive">
                    <div class="com_note">患者の受付用QRコードを読み取ってください。
                        <button @click="isCameraActive = false">キャンセル</button>

                    </div>
                </div>
            </qrcode-stream>
        </div>
        <div v-else style="text-align: center; width: 100%">
            <button @click="isCameraActive = true" class="button b-mainTop">
                QRコードを読み込む
            </button>
            <button @click="inputPreSetData" class="button b-test">
                テスト用：テスト用データの読み込み
            </button>
            <button
                @click="
                    load(
                        '0x2C466b77105fA141afe9dcF8835582AaebFe4077',
                        '0xBF8AC0D55453C6d240273404c11FfBbD33E65aF7'
                    )
                "
                class="button b-test"
            >
                テスト用：発行後画面へ遷移
            </button>
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
            console.log("QR", result);
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
        inputPreSetData() {
            this.encryptedPatientData =
                "U2FsdGVkX1+rV0sMwZBkk+CdPE1DMwBfDNNWWXmcGIMiCaqExFM7qFLILatOgzLUtg6svJFSaeNUQDbl1ovaM7Bt54UiCLdfFZBE8KP99l1KwGsctGxs+ihZvHnI4shkQJx6Tf9ve0zlmHN+I1Bovw==";
            this.patientSign =
                "0x3fe941fab95f1e9e677a698c971540d6585742ebc717803724b5192ecaf192c91241b899f0ceefa81dd7b266f55b464a02248770d189de690a908d4b612e741b1b";
            this.patientPassPhrase =
                "0x0dee43b47ac4052c7074eec6413151ee42c46731cb06c7f9a31763ea26a0fc98";
            let patientDataJson = this.$management.decrypt(
                this.encryptedPatientData,
                this.patientPassPhrase
            );
            this.patientData = JSON.parse(patientDataJson);
            this.patientDataActive = true;

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
        },
        scroleControle() {
            // スクロールを無効にする
            if (this.isCameraActive) {
                $(window).on("touchmove.noScroll", function(e) {
                    e.preventDefault();
                });
            } else {
                // スクロール無効を解除する
                $(window).off(".noScroll");
            }
        }
    }
};
</script>
