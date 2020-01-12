<template>
    <div class="page">
        <ui-alert :dismissible="false"
            >Enter your information! / あなたの情報を入力してください</ui-alert
        >
        <ui-alert :dismissible="false"
            >Filling out is optional / 記入は任意です</ui-alert
        >
        <ui-alert type="warning" :dismissible="false">
            情報はパブリックなブロックチェーンに書き込まれます。暗号化しているので第三者は閲覧できませんが、念の為、正しい情報は入力しないでください。
        </ui-alert>
        <transition name="fade" mode="out-in">
            <div v-if="page === 1" key="1">
                <ui-textbox
                    v-model="patientData['氏名']"
                    label="Name / 氏名"
                ></ui-textbox>
                <ui-textbox
                    v-model="patientData['年齢']"
                    label="Age / 年齢"
                ></ui-textbox>
                <ui-textbox
                    v-model="patientData['性別']"
                    label="Gender / 性別"
                ></ui-textbox>
                <ui-textbox
                    v-model="patientData['電話番号']"
                    label="Phone Numbe / 電話番号"
                ></ui-textbox>
                <div class="center">
                    <button class="button button--normal" @click="page = 2">
                        Next / 次へ
                    </button>
                </div>
            </div>
            <div v-if="page === 2" key="2">
                <ui-textbox
                    v-model="patientData['宗教']"
                    label="Religion / 宗教"
                ></ui-textbox>
                <ui-textbox
                    v-model="patientData['輸血可否']"
                    label="Transfusion Availability / 輸血の可否"
                ></ui-textbox>
                <div class="center">
                    <button class="button button--normal" @click="perocessData">
                        Save / 保存
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    data() {
        return {
            patientData: {},
            page: 1
        };
    },
    methods: {
        perocessData: function() {
            let patientDataJson = JSON.stringify(this.patientData);
            let encryptedPatientData = this.$management.encrypt(
                patientDataJson,
                this.$management.passPhrase
            );
            let qrCodeData =
                this.$management.passPhrase +
                "," +
                encryptedPatientData +
                "," +
                this.$management.signMessage(encryptedPatientData);
            // TODO:暗号化して保存
            localStorage.setItem("patientData", patientDataJson);
            localStorage.setItem("qrCodeData", qrCodeData);
            this.back();
        },
        back() {
            this.$router.push("/");
        }
    },
    created: function() {
        let data = localStorage.getItem("patientData");
        if (data !== null) this.patientData = JSON.parse(data);
    }
};
</script>
