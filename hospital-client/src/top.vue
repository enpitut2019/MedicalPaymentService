<template>
    <div class="page">
        <div v-if="!isCameraActive">
            <ui-alert :dismissible="false">
                1.
                QRコードを読み取ることで患者の情報を確認できます。また、既に受付を行った患者も再度QRコードを読み取ることで詳細ページを開くことができます。
            </ui-alert>
            <ui-alert
                @dismiss="showQRErrorAlert = false"
                type="error"
                v-show="showQRErrorAlert"
            >
                異なるQRコードを読み込んでいます！
            </ui-alert>
            <div class="box">
                <span class="box-title">サービスの概要</span>
                <p>
                    医療費を暗号通貨で支払うことを想定したサービスです。電子カルテなど既存サービスとの共存を前提としています。サービスのメリットとしては
                    ①診療ごとに専用のアドレスを発行することによる病院側の管理コスト軽減
                    ②第三者機関を介さない暗号通貨の自動管理
                    ③伝達ミスを原因とするトラブルの客観的解決
                    などが挙げられます。
                </p>
            </div>
            <div class="center">
                <button
                    @click="isCameraActive = true"
                    class="button button--large"
                >
                    QRコードを読み取る
                </button>
            </div>
        </div>
        <div v-if="isCameraActive">
            <qrcode-stream class="fullscreen" @decode="inputData">
                <div v-if="isCameraActive">
                    <div class="com-note">
                        QRコードを読み取ってください
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
            patientData: "",
            showQRErrorAlert: false
        };
    },
    methods: {
        inputData(result) {
            // 入力がEthereumのAddressだった場合
            if (this.$management.isAddress(result)) {
                this.load(result, "0x3776d2930DC3A7fEd95aaA40dd5A11c9cf189317");
                return;
            }

            try {
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
                this.showQRErrorAlert = false;
            } catch (e) {
                this.isCameraActive = false;
                this.showQRErrorAlert = true;
                return;
            }

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
