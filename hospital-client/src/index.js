//let base = "MedicalPaymentService/hospital-client/dist/";
let base = "/";

import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

import App from "./app.vue";
import Top from "./top.vue";
import Detail from "./detail.vue";
import Confirmation from "./confirmation.vue";
import Account from "./account.vue";

// CSSリセット
import "../node_modules/reset.css";

import KeenUI from "keen-ui";
import "keen-ui/dist/keen-ui.css";
Vue.use(KeenUI);

import VueQrcodeReader from "vue-qrcode-reader";
Vue.use(VueQrcodeReader);

import "./style.css";

const router = new VueRouter({
    mode: "history",
    base: base,
    routes: [
        { path: "/", name: "top", component: Top },
        { path: "/detail", name: "detail", component: Detail },
        {
            path: "/confirmation",
            name: "confirmation",
            component: Confirmation
        },
        { path: "/account", name: "account", component: Account }
    ]
});

// アカウントがない場合は管理画面を開く
if (!localStorage.getItem("hospitalPrivateKey")) {
    // TODO:管理画面を開く
    // テスト用に既定値をセット
    localStorage.setItem(
        "hospitalPrivateKey",
        "0x5DF94F253908A243F9E88702F7100F93736923D3654980814A13FFAB1F42B3BF"
    );
    localStorage.setItem(
        "hospitalPassPhrase",
        "0x5f5278ef122e68c6a0d4e037289317178a0555aad18e5cd1366df39683483b1785bc632ac5c7981a9a98e5660ec35e"
    );
}

// アカウント読み込み TODO:localstorageに保存して大丈夫か
let privateKey = localStorage.getItem("hospitalPrivateKey");
let passPhrase = localStorage.getItem("hospitalPassPhrase");

import Management from "./management.js";
Vue.prototype.$management = new Management(privateKey, passPhrase);

new Vue({
    el: "#app",
    router,
    render: h => h(App)
});
