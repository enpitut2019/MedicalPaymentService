<template>
    <div class="app">
        <div class="header">
            <div v-if="this.$route.path !== 'input'">
                <!--グリッドレイアウト用の空div-->
            </div>
            <div
                class="backbutton"
                @click="back"
                v-if="this.$route.path === 'input'"
            ></div>
            <h1 v-if="this.$route.path === '/'">Top</h1>
            <h1 v-if="this.$route.path === '/input'">Input</h1>
            <h1 v-if="this.$route.path === '/detail'">Detail</h1>
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
