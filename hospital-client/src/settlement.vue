<template>
    <div class="page">
        <div class="container">
            <div class="containerTitle">
                <h1>Deposit Info</h1>
            </div>
            <div class="list">
                <dl>

                    <dt>請求金額</dt>
                    <dd>
                        {{ amountAddSymbol(medicalCost) }}
                    </dd>
                    <dt>未収金金額</dt>
                    <dd>
                        {{ amountAddSymbol(unpaidCost) }}
                    </dd>
                    <dt>デポジット</dt>
                    <dd>
                        {{ amountAddSymbol(deposit) }}
                    </dd>

                </dl>
            </div>
        </div>
    </div>
</template>

<script>
    import Examination from "./examination.js";

    export default {
        "data": function () {
            return {
                "examination": "",
                "contractAddress": "0x0",
                "tokenData": {"decimals": ""},
                "medicalCost": 0,
                "deposit": 0,
                "unpaidCost": 0,
            };
        },
        "created": async function () {
            await this.init();
        },
        "methods": {
            async "init"() {
                this.contractAddress = this.$route.params.contractAddress;
                let tokenAddress = this.$route.params.tokenAddress;
                this.examination = new Examination(
                    this.$management,
                    this.contractAddress,
                    tokenAddress
                );
                // this.medicalCost = this.examination.medicalCost;
                // this.unpaidCost = this.examination.unpaidCost;
                let paymentStatus = await this.examination.getPaymentStatus();
                this.deposit = paymentStatus[0];
                this.medicalCost = paymentStatus[1];
                this.unpaidCost = paymentStatus[2];
                // this.isSignCompleted = paymentStatus[3];
                // イベントの購読
                this.examination.subscribeEvent(this.callBackFunc);
                // 支払い状況の取得
                let promise1 = this.getPaymentStatus();
                // 患者の情報を取得
                let promise2 = this.getPatientInfo();
                // トークン情報の取得
                let promise3 = this.getToeknData();

                // 全てのプロミスを実行
                await Promise.all([promise1, promise2, promise3]);
            },
            async "callBackFunc"(event, value) {
                this.$emit("loading", true);
                // 一瞬で変わると何が起こったか分からないロードを入れる
                await sleep(250);
                console.log(event);
                console.log(value);
                if (event === "SetMedicalCost")
                    this.medicalCost = value["medicalCost"];
                if (event === "SignMedicalCost")
                    this.isSignCompleted = value["signed"];
                if (event === "WithDraw") this.unpaidCost = value["unpaidCost"];
                if (event === "Refund") console.log("Refund" + value["amount"]);
                if (event === "Transfer")
                    this.deposit = Number(this.deposit) + Number(value["value"]);
                this.$emit("loading", false);
            },
            async "getPaymentStatus"() {
                let paymentStatus = await this.examination.getPaymentStatus();
                this.deposit = paymentStatus[0];
                this.medicalCost = paymentStatus[1];
                this.unpaidCost = paymentStatus[2];
                this.isSignCompleted = paymentStatus[3];
            },
            async "getPatientInfo"() {
                let patientInfo = await this.examination.getPatientInfo();
                this.patientAddress = patientInfo.address;
                this.patientData = JSON.parse(patientInfo.data);
            },
            async "getToeknData"() {
                this.tokenData = await this.examination.getTokenData();
            },
            "amountAddSymbol"(value) {
                return (
                    String(
                        Number(value) / 10 ** Number(this.tokenData["decimals"])
                    ) +
                    " " +
                    this.tokenData["symbol"]
                );
            },
        },
    };
</script>