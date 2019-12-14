let base = "MedicalPaymentService/patient-client/dist/";
//let base = "/";

import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

import App from "./app.vue";
import Top from "./top.vue";
import Detail from "./detail.vue";
import Input from "./input.vue";
import Settlement from "./settlement.vue";

// CSSリセット
import "../node_modules/reset.css";

import KeenUI from "keen-ui";
import "keen-ui/dist/keen-ui.css";
Vue.use(KeenUI);

import "./style.css";

const router = new VueRouter({
    mode: "history",
    base: base,
    routes: [
        { path: "/", component: Top },
        { path: "/detail", name: "detail", component: Detail },
        { path: "/input", name: "input", component: Input },
        { path: "/settlement", name: "settlement", component: Settlement }
    ]
});

// アカウントとパス作成
import Web3 from "web3";
if (!localStorage.getItem("patientPrivateKey")) {
    console.log("Create Account");
    let web3 = new Web3();
    let account = web3.eth.accounts.create();
    // テストのためパスは同一（データがロードできなくなるため）
    //let passPhrase = web3.utils.randomHex(32);
    let passPhrase =
        "0x0dee43b47ac4052c7074eec6413151ee42c46731cb06c7f9a31763ea26a0fc98";
    localStorage.setItem("patientPrivateKey", account.privateKey);
    localStorage.setItem("patientPassPhrase", passPhrase);
}

// アカウント読み込み TODO:loaclstorageに保存して大丈夫か
let privateKey = localStorage.getItem("patientPrivateKey");
let passPhrase = localStorage.getItem("patientPassPhrase");

import Management from "./management.js";
Vue.prototype.$management = new Management(privateKey, passPhrase);

new Vue({
    el: "#app",
    router,
    render: h => h(App)
});
