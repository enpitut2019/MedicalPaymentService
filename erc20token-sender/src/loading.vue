<template>
    <div :style="style" ref="container" class="loading"></div>
</template>

<script>
import lottie from "lottie-web";
import * as animationData from "./load.json";

export default {
    props: {
        height: Number,
        width: Number
    },
    data() {
        return {
            style: {
                width: this.width ? `${this.width}px` : "100%",
                height: this.height ? `${this.height}px` : "100%",
                overflow: "hidden"
            }
        };
    },
    mounted() {
        this.anim = lottie.loadAnimation({
            container: this.$refs.container,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData: animationData.default
        });
    }
};
</script>

<style scoped>
.loading {
    width: 100%;
    margin: 0 auto;
}
</style>
