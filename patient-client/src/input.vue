<template>
    <div class="page">
        <h2>Enter your information! / あなたの情報を入力してください</h2>
        <h2>Filling out is optional / 記入は任意です</h2>
        <transition name="fade" mode="out-in">
            <div v-if="page === 1" key="1">
                <ui-textbox
                    v-model="patientData['name']"
                    label="Name / 氏名"
                ></ui-textbox>
                <ui-textbox
                    v-model="patientData['age']"
                    label="Age / 年齢"
                ></ui-textbox>
                <ui-textbox
                    v-model="patientData['gender']"
                    label="Gender / 性別"
                ></ui-textbox>
                <ui-textbox
                    v-model="patientData['phone']"
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
                    v-model="patientData['religion']"
                    label="Religion / 宗教"
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
import VueQrcode from "@chenfengyuan/vue-qrcode";
export default {
    components: {
        VueQrcode
    },
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
