<template>
    <div class="dioramas" v-if="roomState.currentStep.name.slice(0,7) === 'diorama'">
        <div class="videoContainer" v-bind:class="{ desktop: !isMobile }" >
            <video ref="video" src="/assets/videos/pluriel.mp4" @loadedmetadata="videoLoaded" @timeupdate="onVideoTimeUpdate" autoplay loop></video>
        </div>

        <button class="skip" @click.once="onSkip">Passer</button>

        <div class="interfaceMobile" v-if="isMobile">
            Histoire

            <div class="circleTime">
                <svg width="100" height="100">
                    <circle
                        class="circleBg"
                        stroke="#efefef"
                        opacity="0.5"
                        stroke-width="1"
                        fill="none"
                        cx="20"
                        cy="20"
                        r="15.91549431"
                    ></circle>
                    <circle 
                        class="circleFill"
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
            
            if(this.isMobile){
                this.videoProgress = (this.$refs.video.currentTime / this.videoDuration) * 100
                this.$refs.videoProgression.style.strokeDasharray = `${this.videoProgress}, 100`;
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
        border: solid 1px red;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;

        .circleTime {
            margin: 50px 10px;
            position: relative;
            width: 80px;
            height: 80px;

            &::before {
                position: absolute;
                top: -40px;
                left: 50%;
                font-weight: bold;
                transform: translateX(-50%);
            }

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
                    transform-origin: 3px 3px;

                    transform: scale(2.8);
                }
            }
        }
    }
}
</style>


