<template>
    <div class="dioramas" v-if="roomState.currentStep.name.slice(0,7) === 'diorama'">
        <div class="videoContainer" v-bind:class="{ desktop: !isMobile }" >
            <video ref="video" v-if="!isMobile" src="/assets/videos/pluriel.mp4" @loadedmetadata="videoLoaded" @timeupdate="onVideoTimeUpdate" autoplay></video>
        </div>

        <button class="skip" v-if="!isMobile" @click.once="onSkip">Passer</button>

        <div class="interfaceMobile textGlow" v-if="isMobile">
            Histoire

            <div class="circleTime">
                <svg width="200" height="200">
                    <circle
                        stroke="#efefef"
                        opacity="0.5"
                        stroke-width="1"
                        fill="none"
                        cx="20"
                        cy="20"
                        r="15.91549431"
                    ></circle>
                    <circle 
                        ref="videoProgression"
                        stroke="#fff"
                        stroke-width="1"
                        stroke-dasharray="0 100"
                        fill="none"
                        cx="20"
                        cy="20"
                        r="15.91549431"
                    ></circle>
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
import { bus } from "@/main"
import { setTimeout } from 'timers';
import socket from "@/socket.js";

export default {
    name: "experience",
    components: {},
    props: {
        roomState: Object
    },
    data() {
        return {
            videoProgress: 0,
            videoDuration: 0
        }
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
        },
        onVideoTimeUpdate(event){
            if(this.$refs.video){
                this.videoProgress = (this.$refs.video.currentTime / this.videoDuration) * 100
                socket.emit("video update", this.videoProgress)
            }
        },
        videoLoaded(){
            this.videoDuration = this.$refs.video.duration
        }
    },
    mounted: function() {
        if(!this.isMobile){
            this.$refs.video.addEventListener("ended", this.onSkip)
        }

        socket.on("video updating", videoProgression => {
            if(this.isMobile){
                this.$refs.videoProgression.style.strokeDasharray = `${videoProgression}, 100`;
            }
        })
    }
}
</script>

<style scoped lang="scss">
@import "@/config/styles.scss";

div.dioramas {
    padding: 0!important;

    .videoContainer{
        width: 100%;
        height: 100%;

        video{
            opacity: 0;
            position: absolute;
            top: 50%;
            left: 50%;
            -webkit-transform: translate3d(-50%,-50%,0);
            transform: translate3d(-50%,-50%,0);
            width: 100%;
            height: auto;
        }

        &.desktop{
            background-color: $black;

            video{
                opacity: 1;
            }
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

    .interfaceMobile{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        font-size: 18px;

        .circleTime {
            margin-top: 20px;
            position: relative;
            width: 200px;
            height: 200px;

            img,
            svg {
                top: 50%;
                left: 50%;
                position: absolute;
                transform: translate(-50%, -50%);
            }

            svg {
                z-index: 3;
                transform-origin: center left;
                transform: rotate(-90deg);

                circle {
                    transition: all 0.25s ease;

                    transform: scale(5);
                }
            }
        }
    }
}
</style>


