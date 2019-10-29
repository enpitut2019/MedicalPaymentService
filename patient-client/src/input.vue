<template>
    <div class="page">
        <ui-textbox v-model="patientData['Name']" label="Name"></ui-textbox>
        <ui-textbox v-model="patientData['age']" label="Age"></ui-textbox>
        <ui-radio-group
            name="bloodTransfusion"
            :options="options.yesOrNo"
            v-model="patientData['Transfusion']"
            >No blood transfusion</ui-radio-group
        >
        <ui-textbox
            v-model="patientData['phone']"
            label="Phone Number"
        ></ui-textbox>
        <ui-textbox
            v-model="patientData['other']"
            label="実際には他の情報も"
        ></ui-textbox>
        <ui-button @click="perocessData">データ保存</ui-button>
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
            patientData: { Name: "", Age: "", Transfusion: "no" },
            options: {
                yesOrNo
            }
        };
    },
    methods: {
        perocessData: function() {
            let patientDataJson = JSON.stringify(this.patientData);
            let encryptedPatientData = this.$management.encrypt(
                patientDataJson
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