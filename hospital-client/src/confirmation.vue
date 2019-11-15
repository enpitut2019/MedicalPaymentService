<template>
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
        <div style="text-align: center">
            <button class="button b-mainConf" @click="deployContract">アドレスを発行する</button><br>
            <button class="button b-test" @click="load('0x33571Ca9deC342c9cC14bBaC6d5C50517D2e2c24')"
            >テスト用：発行後画面へ遷移
            </button>
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
        callBackFunc(event, value) {
            console.log("deploy :" + value.contractAddress);
            this.load(value.contractAddress, value.tokenAddress);
        }
    },
    destroyed: function() {
        this.$management.unload();
    }
};
</script>
