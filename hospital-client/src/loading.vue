<template>
    <div>
        <div class="fadeLayer"></div>
        <div :style="style" class="animationLayer" ref="container"></div>
    </div>
</template>

<script>
import lottie from "lottie-web";
import * as animationData from "./assets/load.json";

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
.fadeLayer {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    background-color: #000000;
    opacity: 0.75;
    z-index: 2;
}

.animationLayer {
    position: fixed;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    z-index: 3;
}
</style>
