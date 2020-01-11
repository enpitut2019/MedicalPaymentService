<template>
    <div class="page">
        <div class="container">
            <div class="containerTitle">
                <h1>Deposit Info</h1>
            </div>
            <p>コントラクトアドレス {{ contractAddress }}</p>
            <p>
                医療機関に {{ paidToHospital }} 支払い
                {{ paidToPatient }} 返金されました
            </p>
            <p>
                任意のウォレットで秘密鍵
                {{ privateKey }} をインポートしてください
            </p>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            contractAddress: "0x0",
            paidToHospital: 0,
            paidToPatient: 0,
            privateKey: ""
        };
    },
    created: async function() {
        this.contractAddress = this.$route.params.contractAddress;
        this.paidToHospital = this.$route.params.paidToHospital;
        this.paidToPatient = this.$route.params.paidToPatient;
        this.privateKey = localStorage.getItem("patientPrivateKey");
    },
    methods: {}
};
</script>
