<template>
    <div>
        JE SUIS LA PAGE EXPERIENCE
        <!--Desktop stuff -->
        <TrackerVideo v-if="!isMobile" :hasStarted="camIsActive" v-show="this.uiDatas.isDebugMode"/>

        <!-- Mobile stuff -->
        <div v-if="isMobile">
            <div v-if="character === 'lamar'">
                JE SUIS LAMAR
                <img src="assets/img/AmulettesTest_Lamar.png" alt>
            </div>
            <div v-if="character === 'zanit'">
                JE SUIS ZANIT
                <img src="assets/img/AmulettesTest_Zanit.png" alt>
            </div>
        </div>
    </div>
</template>

<script>
import TrackerVideo from "@/components/TrackerVideo.vue";
import socket from "@/socket.js";

export default {
    name: "experience",
    components: { TrackerVideo },
    props: {
        roomState: Object
    },
    data: () => ({
        uiDatas: {
            isDebugMode: true
        },
        camIsActive: true,
        character: undefined
    }),
    props: {
        roomId: String,
        isMobile: Boolean,
        users: Array,
        roomState: Object
    },
    mounted() {
        if (this.roomState.lamar === socket.id) {
            this.character = "lamar";
        } else if (this.roomState.zanit === socket.id) {
            this.character = "zanit";
        } else {
            this.character = undefined;
        }
    }
};
</script>

<style scoped lang="scss">
@import "@/config/styles.scss";

div {
    color: #fff;
}

video {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
}

img {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
}
</style>
