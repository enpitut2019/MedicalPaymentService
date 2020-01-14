<template>
    <div class="page">
        <div v-if="!isCameraActive">
            <ui-alert :dismissible="false">
                1.
                QRコードを読み取ることで患者の情報を参照できます。また、既に受付を行った患者の画面下部に表示されるQRコードを読み込むことで再度詳細ページを開くことができます。
            </ui-alert>
            <div class="box">
                <span class="box-title">サービスの概要（要改稿）</span>
                <p>
                    外国人旅行者が医療機関を受診した際に母国の親族が暗号通貨で支払いを行うことを想定したサービスです。
                    電子カルテなど既存サービスとの共存を前提としています。
                    暗号通貨を使う以外のメリットとしては、
                </p>
                <p>
                    ①診療ごとに専用のアドレスを発行することによる病院側の管理コスト軽減
                </p>
                <p>
                    ②前払い…支払い能力の確認
                </p>
                <p>
                    ③言語の違いによって起こりうる伝達ミスを起因とするトラブルの客観的解決
                </p>
                <p>
                    などが挙げられます。あああああああああああああああああああああああああああああああああああああああああああああ
                </p>
            </div>
            <div class="center">
                <button
                    @click="isCameraActive = true"
                    class="button button--large"
                >
                    QRコードを読み込む
                </button>
            </div>
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
