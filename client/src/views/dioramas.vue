<template>
    <div class="dioramas" v-if="roomState.currentStep.name.slice(0,7) === 'diorama'">
        <div class="videoContainer">
            <video ref="video" src="/assets/videos/pluriel3.mp4" autoplay></video>
        </div>

        <button class="skip" @click.once="onSkip">Passer</button>
    </div>
</template>

<script>
import { bus } from "@/main"

export default {
    name: "experience",
    components: {},
    props: {
        roomState: Object
    },
    data() {
        return {}
    },
    props: {
        roomId: String,
        isMobile: Boolean,
        users: Array,
        roomState: Object
    },
    methods: {
        onSkip() {
            bus.$emit("setRoomState", {currentStep: {name:'NEXT'}})
        }
    },
    mounted: function() {
        this.$refs.video.addEventListener("ended", this.onSkip)
    }
}
</script>

<style scoped lang="scss">
@import "@/config/styles.scss";

div.dioramas {
    padding: 0!important;

    .videoContainer{
        background-color: $black;
        height: 100%;

        video{
            position: absolute;
            top: 50%;
            left: 50%;
            -webkit-transform: translate3d(-50%,-50%,0);
            transform: translate3d(-50%,-50%,0);
            width: 100%;
            height: auto;
        }
    }

    .skip{
        color: $white;
        position: absolute;
        bottom: 30px;
        right: 30px;
        text-transform: uppercase;

          &:hover {
            @extend .textGlow;
        }
    }
}
</style>


