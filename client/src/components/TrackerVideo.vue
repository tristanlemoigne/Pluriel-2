<template>
    <video ref="video" width="341" height="256" autoplay muted/>
</template>

<script>
import Tracker from "../threejs/sceneEntities/tracker/Tracker.js"

import { threeBus } from "../main"

export default {
    name: "TrackerVideo",
    props: {
        hasStarted: false
    },
    data: () => ({
        tracker: null
    }),
    methods: {
        /* ----------------------- TRACKER ----------------------- */
        startTracker() {
            this.tracker = Tracker(this.$refs.video)
            this.tracker.onTrack(trackedDatas => {
                threeBus.$emit("track", trackedDatas)
            })
        }
    },
    watch: {
        hasStarted() {
            if (this.hasStarted === true) {
                this.startTracker()
            }
        }
    },
    mounted() {
        if (this.hasStarted === true) {
            this.startTracker()
        }
    }
}
</script>

<style lang="scss" scoped>
video {
    transform: scaleX(-1);
}
</style>
