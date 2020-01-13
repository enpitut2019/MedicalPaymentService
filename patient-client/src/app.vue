<template>
    <div class="app">
        <div class="header">
            <div @click="back">
                <ui-icon
                    icon="keyboard_arrow_left"
                    v-if="this.$route.path === '/input'"
                ></ui-icon>
            </div>
            <h1 v-if="this.$route.path === '/'">{{ t("title1") }}</h1>
            <h1 v-if="this.$route.path === '/input'">{{ t("title2") }}</h1>
            <h1 v-if="this.$route.path === '/detail'">{{ t("title3") }}</h1>
            <div @click="changeLanguage">
                <ui-icon icon="language"></ui-icon>
            </div>
        </div>
        <transition mode="out-in" :name="transitionName">
            <router-view @loading="loading"></router-view>
        </transition>
        <loading v-if="isLoading" :height="300" :width="300" />
    </div>
</template>

<script>
import Loading from "./loading.vue";
export default {
    components: {
        Loading
    },
    data: function() {
        return {
            isLoading: false,
            transitionName: "",
            langNo: 0
        };
    },
    mounted() {
        this.$translate.setLang("ja");
    },
    methods: {
        loading(bool) {
            this.isLoading = bool;
        },
        back() {
            this.$router.push("/");
        },
        changeLanguage() {
            let langList = ["ja", "en", "ru"];
            this.langNo = (this.langNo + 1) % langList.length;
            this.$translate.setLang(langList[this.langNo]);
        }
    },
    watch: {
        $route(to) {
            if (to.path === "/") {
                this.transitionName = "slide-right";
            }
            if (to.path === "/input") {
                this.transitionName = "slide-left";
            }
            if (to.path === "/detail") {
                this.transitionName = "slide-left";
            }
            if (to.path === "/settlement") {
                this.transitionName = "slide-left";
            }
        }
    },
    locales: {
        en: {
            title1: "Top",
            title2: "Input",
            title3: "Detail"
        },
        ja: {
            title1: "トップ",
            title2: "入力",
            title3: "詳 細"
        },
        ru: {
            title1: "топ",
            title2: "вход"
        }
    }
};
</script>
