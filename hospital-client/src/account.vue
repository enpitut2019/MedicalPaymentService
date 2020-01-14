<template>
    <div class="page">
        <ui-alert :dismissible="false">
            Ethereumアカウントの秘密鍵を入力してください
        </ui-alert>
        <ui-textbox v-model="privateKey" label="秘密鍵"></ui-textbox>
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
            privateKey: ""
        };
    },
    methods: {
        save: function() {
            localStorage.setItem("hospitalPrivateKey", this.privateKey);
            location.reload();
        }
    },
    created: function() {
        let data = localStorage.getItem("patientData");
        if (data !== null) this.patientData = JSON.parse(data);
    }
};
</script>
