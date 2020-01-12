<template>
    <div class="app">
        <div class="header">
            <div
                class="backbutton"
                @click="back"
                v-if="this.$route.path === '/input'"
            ></div>
            <h1 v-if="this.$route.path === '/'">Top / 受付</h1>
            <h1 v-if="this.$route.path === '/input'">Input / 入力</h1>
            <h1 v-if="this.$route.path === '/detail'">Detail / 詳細</h1>
            <h1 v-if="this.$route.path === '/settlement'">
                Completed / 決済完了
            </h1>
        </div>
        <transition mode="out-in" :name="transitionName">
            <router-view @loading="loading"></router-view>
        </transition>
        <loading v-if="isLoading" :height="300" :width="300" />
        <button class="button button--normal" @click="testMethod">
            テスト用：秘密鍵リセット
        </button>
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
            transitionName: ""
        };
    },
    methods: {
        loading(bool) {
            this.isLoading = bool;
        },
        back() {
            this.$router.push("/");
        },
        testMethod() {
            localStorage.clear();
            window.location.href = "/";
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
    }
};
</script>
