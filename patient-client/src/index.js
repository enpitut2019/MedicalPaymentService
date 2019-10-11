import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

import App from "./app.vue";
import Top from "./top.vue";
import About from "./about.vue";

import "./style.css";

const router = new VueRouter({
    mode: "history",
    base: "MedicalPaymentService/patient-client/dist/",
    routes: [{ path: "/", component: Top }, { path: "/about", component: About }]
});

new Vue({
    el: "#app",
    router,
    render: h => h(App)
});

// テスト用に秘密鍵とアドレス,パスフレーズはセットしておく
localStorage.setItem('privateKey', "0x0D274BD5D6DC605137D958AC2DB9C9BD189FF86338150A04C7DB4B3E942FAC0C");
localStorage.setItem('address', "0x5f527BD60061b937836526BAe83bB4581f9bAc01");
localStorage.setItem('passPhrase', "0x5f5278ef122e68c6a0d4e037289317178a0555aad18e5cd1366df39683483b1785bc632ac5c7981a9a98e5660ec35e");