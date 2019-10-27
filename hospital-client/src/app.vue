<template>
    <div class="app">
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
        }
    }
};
</script>
