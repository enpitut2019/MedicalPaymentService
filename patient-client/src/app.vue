<template>
    <div class="app">
        <div class="header">
            <div v-if="this.$route.path === '/'">
                <!--グリッドレイアウト用の空div-->
            </div>
            <div
                class="backbutton"
                @click="back"
                v-if="
                    this.$route.path === '/input' ||
                        this.$route.path === '/detail' ||
                        this.$route.path === '/settlement'
                "
            ></div>
            <h1 v-if="this.$route.path === '/'">Top</h1>
            <h1 v-if="this.$route.path === '/input'">Input</h1>
            <h1 v-if="this.$route.path === '/detail'">Detail</h1>
            <h1 v-if="this.$route.path === '/settlement'">Settlement</h1>
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
