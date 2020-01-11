<template>
    <div class="page">
        <div class="container">
            <div class="containerTitle">
                <h1>Deposit Info</h1>
            </div>
            <p>コントラクトアドレス {{ contractAddress }}</p>
            <p>
                {{ paidToHospital }} 受け取り {{ paidToPatient }} 返金しました
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
            paidToPatient: 0
        };
    },
    created: async function() {
        this.contractAddress = this.$route.params.contractAddress;
        this.paidToHospital = this.$route.params.paidToHospital;
        this.paidToPatient = this.$route.params.paidToPatient;
    },
    methods: {}
};
</script>
