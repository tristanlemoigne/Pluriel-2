<template>
    <div>
        JE SUIS LA PAGE EXPERIENCE
        <TrackerVideo v-if="!isMobile" :hasStarted="camIsActive" v-show="this.uiDatas.isDebugMode"/>
    </div>
</template>

<script>
import TrackerVideo from "@/components/TrackerVideo.vue";

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
        camIsActive: true
    }),
    props: {
        roomId: String,
        isMobile: Boolean,
        users: Array,
        roomState: Object
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
</style>
