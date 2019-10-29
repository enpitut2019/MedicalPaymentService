<template>
    <div class="centering_parent">
        <h1>暗号通貨（ERC20）の送金</h1>
        <ui-alert
            @dismiss="showAlert1 = false"
            type="error"
            v-show="showAlert1"
        >
            Something is wrong!!
        </ui-alert>
        <div class="box">
            <div class="innerBox">
                <h3>enpit実験用に作成したERC20トークン</h3>
                <h3>送金先と送金額を入力するだけで送金できます</h3>
            </div>
        </div>
        <ui-progress-linear
            color="black"
            v-show="isLoading"
        ></ui-progress-linear>
        <div class="box">
            <h2>{{ tokenBalance + " " + tokenName }}</h2>
            <div class="innerBox" v-if="!isLoading">
                <ui-textbox
                    v-model="toAddress"
                    label="送金先アドレス"
                ></ui-textbox>
                <ui-textbox
                    v-model="transferValue"
                    label="送金額(整数)"
                ></ui-textbox>
                <ui-textbox
                    v-model="address"
                    label="送金元アドレス"
                    readonly
                ></ui-textbox>
                <ui-button @click="transfer">Transfer</ui-button>
            </div>
            <loading v-if="isLoading" :height="300" :width="300" />
        </div>
        <div class="box">
            <h2>{{ etherBalance + " ETH (Ether)" }}</h2>
        </div>
    </div>
</template>

<script>
import Erc20Token from "./erc20token.js";
const erc20Token = new Erc20Token();
import Loading from "./loading.vue";

export default {
    components: {
        Loading
    },
    data() {
        return {
            tokenAddress: "0xBF8AC0D55453C6d240273404c11FfBbD33E65aF7",
            privateKey:
                "0x0D274BD5D6DC605137D958AC2DB9C9BD189FF86338150A04C7DB4B3E942FAC0C",
            address: "",
            tokenName: "",
            tokenDecimals: 0,
            tokenBalance: 0,
            etherBalance: 0,
            toAddress: "",
            transferValue: "",
            showAlert1: false,
            isLoading: false
        };
    },
    mounted: async function() {
        this.address = erc20Token.privateKeyToAddress(this.privateKey);
        await erc20Token.setTokenAddress(this.tokenAddress);
        let tokenInfo = await erc20Token.getTokenInfo();
        this.tokenName = tokenInfo.symbol + " (" + tokenInfo.name + ")";
        this.tokenDecimals = tokenInfo.decimals;
        await this.getBalance();
    },
    methods: {
        async getBalance() {
            this.tokenBalance = await erc20Token.tokenBalanceOf(this.address);
            this.tokenBalance = Math.floor(
                this.tokenBalance / 10 ** this.tokenDecimals
            );
            this.etherBalance = await erc20Token.etherBalancOf(this.address);
            this.etherBalance =
                Math.floor(this.etherBalance * 10 ** 4) / 10 ** 4;
        },
        async transfer() {
            try {
                this.isLoading = true;
                await erc20Token.transferERC20Token(
                    this.toAddress,
                    this.transferValue
                );
                await this.getBalance();
                this.toAddress = "";
                this.transferValue = "";
                this.isLoading = false;
            } catch (e) {
                this.showAlert1 = true;
                this.isLoading = false;
            }
        }
    }
};
</script>
