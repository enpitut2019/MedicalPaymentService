<template>
    <div class="app">
        <div class="header">
            <div @click="back">
                <ui-icon
                    icon="keyboard_arrow_left"
                    v-if="this.$route.path !== '/'"
                ></ui-icon>
            </div>
            <h1 v-if="this.$route.path === '/'">受 付</h1>
            <h1 v-if="this.$route.path === '/confirmation'">確 認</h1>
            <h1 v-if="this.$route.path === '/detail'">詳 細</h1>
            <h1 v-if="this.$route.path === '/settlement'">決 済 完 了</h1>
            <h1 v-if="this.$route.path === '/account'">ア カ ウ ン ト</h1>
            <div @click="account">
                <ui-icon
                    icon="account_circle"
                    v-if="this.$route.path === '/'"
                ></ui-icon>
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
        account() {
            this.$router.push("/account");
        }
    },
    watch: {
        $route(to) {
            if (to.path === "/") {
                this.transitionName = "slide-right";
            }
            if (to.path === "/confirmation") {
                this.transitionName = "slide-left";
            }
            if (to.path === "/detail") {
                this.transitionName = "slide-left";
            }
            if (to.path === "/settlement") {
                this.transitionName = "slide-left";
            }
            if (to.path === "/account") {
                this.transitionName = "slide-left";
            }
        }
    }
};
</script>
