<template>
    <div class="app">
        <div class="header">
            <div
                class="backbutton"
                @click="back"
                v-if="this.$route.path !== '/'"
            >
                <span></span>
            </div>
            <img src="./testlogo.png" />
            <p>TODO:ロゴをちゃんとしたものに差し替える</p>
        </div>
        <transition mode="out-in">
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
            isLoading: false
        };
    },
    methods: {
        loading(bool) {
            this.isLoading = bool;
        },
        back() {
            console.log(this.$route.path);
            this.$router.push("/");
        }
    }
};
</script>
