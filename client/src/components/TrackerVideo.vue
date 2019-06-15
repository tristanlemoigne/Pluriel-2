<template>
    <div class="trackerVideo">
        <canvas ref="tutoCanvas" class="tutoCanvas" />
        <video ref="video" width="170" height="128" autoplay muted/>
    </div>
</template>

<script>
import Tracker from "../threejs/sceneEntities/tracker/Tracker.js";

import { threeBus } from "../main";

export default {
    name: "TrackerVideo",
    props: {
        hasStarted: false
    },
    data: () => ({
        tracker: null,
        cyanAmulette: null,
        magentaAmulette: null,
        context: null, 
    }),
    methods: {
        /* ----------------------- TRACKER ----------------------- */
        startTracker() {
            this.tracker = Tracker(this.$refs.video);
            this.tracker.onTrack(trackedDatas => {
                threeBus.$emit("track", trackedDatas);

                this.context.clearRect(0, 0, this.$refs.tutoCanvas.width, this.$refs.tutoCanvas.height);
                this.context.save()
                    if(trackedDatas.cyanBlob){
                        this.updateAmulette(this.cyanAmulette, trackedDatas.cyanBlob)
                    }
                    if(trackedDatas.pinkBlob){
                        this.updateAmulette(this.pinkAmulette, trackedDatas.pinkBlob)
                    }
                this.context.restore()
            });
        },
        createAmulettes(){
            this.cyanAmulette = new Image();
            this.cyanAmulette.src = "/assets/img/AmuletteLamar.png";
            this.pinkAmulette = new Image();
            this.pinkAmulette.src = "/assets/img/AmuletteZanit.png";
        },
        updateAmulette(amulette, blob){
            console.log(blob.x)
            this.context.drawImage(amulette, blob.x, blob.y     , blob.width, blob.height);
        }
    },
    watch: {
        hasStarted() {
            if (this.hasStarted === true) {
                this.startTracker();
            }
        }
    },
  
    mounted() {
        if (this.hasStarted === true) {
            this.startTracker();
        }

        this.$data.context = this.$refs.tutoCanvas.getContext('2d')
        this.createAmulettes();
    },
    beforeDestroy() {
        this.tracker.stop();
    }
};
</script>

<style lang="scss" scoped>
div.trackerVideo{
    width: 40vw;
    height: auto;
    margin-right: 100px;
    position: relative;

    canvas{
        position: absolute;
        top: 0; 
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 4;
    }

    video {
        // border: solid 1px blue;
        // transform: scaleX(-1);
        width: 40vw;
        height: auto;
    }
}

</style>
