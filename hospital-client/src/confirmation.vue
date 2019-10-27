m<template>
    <div>
        <div class="page">
            <div class="container">
                <div class="containerTitle">
                    <h1>Patient Information</h1>
                </div>
                <div class="list">
                    <dl>
                        <span
                            v-for="(value, name, index) in patientData"
                            :key="index"
                        >
                            <dt>{{ name }}</dt>
                            <dd>{{ value }}</dd>
                        </span>
                    </dl>
                </div>
            </div>
            <ui-button @click="deployContract"
                >患者専用のアドレスを発行
            </ui-button>
            <ui-button @click="">読み込みデータの破棄 </ui-button>
            <ui-button
                @click="load('0xFA8AFb171e3793763CF7a8A4FF47A98edFfC759A')"
                >テスト用：発行後画面へ遷移
            </ui-button>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            encryptedPatientData: "",
            patientSign: "",
            patientPassPhrase: "",
            patientData: ""
        };
    },
    mounted: function() {
        this.encryptedPatientData = this.$route.params.encryptedPatientData;
        this.patientSign = this.$route.params.patientSign;
        this.patientPassPhrase = this.$route.params.patientPassPhrase;
        this.patientData = this.$route.params.patientData;
        this.$management.subscribeEvent(this.callBackFunc);
    },
    methods: {
        async deployContract() {
            this.$emit("loading", true);
            await this.$management.deploy(
                this.encryptedPatientData,
                this.patientSign,
                this.patientPassPhrase
            );
        },
        async load(contractAddress) {
            this.$emit("loading", true);
            this.$router.push({
                name: "detail",
                params: { address: contractAddress }
            });
        },
        callBackFunc(event, value) {
            if (value.hospitalAddress === this.$management.getAddress()) {
                this.load(value.contractAddress);
            }
        }
    },
    destroyed: function() {
        this.$management.unload();
    }
};
</script>
