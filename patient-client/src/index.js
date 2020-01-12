//let base = "MedicalPaymentService/patient-client/dist/";
let base = "/";

import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

import App from "./app.vue";
import Top from "./top.vue";
import Detail from "./detail.vue";
import Input from "./input.vue";

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
        { path: "/input", name: "input", component: Input }
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

// Webフォントの読込
(function(d) {
    var config = {
            kitId: "yml0ifp",
            scriptTimeout: 3000,
            async: true
        },
        h = d.documentElement,
        t = setTimeout(function() {
            h.className =
                h.className.replace(/\bwf-loading\b/g, "") + " wf-inactive";
        }, config.scriptTimeout),
        tk = d.createElement("script"),
        f = false,
        s = d.getElementsByTagName("script")[0],
        a;
    h.className += " wf-loading";
    tk.src = "https://use.typekit.net/" + config.kitId + ".js";
    tk.async = true;
    tk.onload = tk.onreadystatechange = function() {
        a = this.readyState;
        if (f || (a && a != "complete" && a != "loaded")) return;
        f = true;
        clearTimeout(t);
        try {
            Typekit.load(config);
        } catch (e) {}
    };
    s.parentNode.insertBefore(tk, s);
})(document);

new Vue({
    el: "#app",
    router,
    render: h => h(App)
});
