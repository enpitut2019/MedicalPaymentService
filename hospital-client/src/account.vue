<template>
    <div class="page">
        <ui-alert :dismissible="false">
            医療機関ごとにEthereumアカウントの秘密鍵と本サービスのパスフレーズを入力してください
        </ui-alert>
        <ui-alert type="warning" :dismissible="false">
            デモ用メッセージ：Etherを保持していないアカウントは本サービスを利用できません。以下項目を操作しないでください。
        </ui-alert>
        <ui-textbox v-model="privateKey" label="秘密鍵"></ui-textbox>
        <ui-textbox v-model="passPhrase" label="パスフレーズ"></ui-textbox>
        <div class="center">
            <button class="button button--normal" @click="save">
                保存
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            privateKey: "",
            passPhrase: ""
        };
    },
    methods: {
        save: function() {
            localStorage.setItem("hospitalPrivateKey", this.privateKey);
            localStorage.setItem("hospitalPassPhrase", this.passPhrase);
            location.reload();
        }
    }
};
</script>
