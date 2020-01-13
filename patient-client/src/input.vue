<template>
    <div class="page">
        <ui-alert :dismissible="false">{{ t("info_text1") }}</ui-alert>
        <ui-alert type="warning" :dismissible="false">
            デモ用メッセージ：情報はパブリックなブロックチェーンに書き込まれます。暗号化しているので第三者は閲覧できませんが、念の為、正しい情報は入力しないでください。
        </ui-alert>
        <transition name="fade" mode="out-in">
            <div v-if="page === 1" key="1">
                <ui-textbox
                    v-model="patientData['氏名']"
                    :label="t('name')"
                ></ui-textbox>
                <ui-textbox
                    v-model="patientData['性別']"
                    :label="t('gender')"
                ></ui-textbox>
                <ui-textbox
                    v-model="patientData['生年月日']"
                    :label="t('date_of_birth')"
                ></ui-textbox>
                <ui-textbox
                    v-model="patientData['電話番号']"
                    :label="t('phone_number')"
                ></ui-textbox>
                <div class="center">
                    <button class="button button--normal" @click="page = 2">
                        {{ t("next") }}
                    </button>
                </div>
            </div>
            <div v-if="page === 2" key="2">
                <ui-textbox
                    v-model="patientData['宗教']"
                    :label="t('religion')"
                ></ui-textbox>
                <ui-textbox
                    v-model="patientData['輸血可否']"
                    :label="t('transfusion_availability')"
                ></ui-textbox>
                <div class="center">
                    <button class="button button--normal" @click="perocessData">
                        {{ t("save") }}
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
    locales: {
        en: {
            info_text1: "Enter your information! (Filling out is optional)",
            name: "Name",
            gender: "Gender",
            date_of_birth: "Date of birth",
            phone_number: "Phone Number",
            religion: "Religion",
            transfusion_availability: "Transfusion Availability",
            next: "Next",
            save: "Save"
        },
        ja: {
            info_text1:
                "あなたの情報を入力してください（全ての項目が任意です）",
            name: "名前",
            gender: "性別",
            date_of_birth: "生年月日",
            phone_number: "電話番号",
            religion: "宗教",
            transfusion_availability: "輸血の可否",
            next: "次へ",
            save: "保存"
        }
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
