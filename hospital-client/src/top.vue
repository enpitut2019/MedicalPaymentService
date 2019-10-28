<template>
    <div class="page">
        <div class="fullscreen" v-if="isCameraActive">
            <qrcode-stream @decode="inputData"></qrcode-stream>
        </div>
        <h1>使い方</h1>
        <p>使い方<br /><br /><br />aaaaaaaaaa<br /></p>
        <ui-button @click="isCameraActive = true">
            QRコードの読込
        </ui-button>
        <ui-button @click="inputPreSetData">
            テスト用：テスト用データの読み込み
        </ui-button>
        <ui-button @click="load('0x33571Ca9deC342c9cC14bBaC6d5C50517D2e2c24')"
            >テスト用：発行後画面へ遷移
        </ui-button>
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
        async load(contractAddress) {
            this.$emit("loading", true);
            this.$router.push({
                name: "detail",
                params: { address: contractAddress }
            });
        }
    }
};
</script>

<style scoped>
/*============================================
アニメーション
============================================*/
.v-enter {
    opacity: 0;
    transform: translateX(-100%);
}
.v-enter-to {
    opacity: 1;
}
.v-enter-active {
    transition: opacity 300ms ease-out, transform 300ms ease-out;
}
.v-leave {
    opacity: 1;
}
.v-leave-to {
    opacity: 0;
    transform: translateX(-100%);
}
.v-leave-active {
    transition: opacity 300ms ease-out, transform 300ms ease-out;
}
</style>
