import Vue from "vue";

import App from "./app.vue";

import KeenUI from "keen-ui";
import "keen-ui/dist/keen-ui.css";
Vue.use(KeenUI);

import "./style.css";

new Vue({
    el: "#app",
    render: h => h(App)
});
