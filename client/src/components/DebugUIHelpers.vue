<template>
    <div class="debugUI" v-if="isDebugMode">
        <!-- <button
            class="debugButton"
            v-if="isDebugMode"
            @click="setRoomState({currentStep: {name:'home'}})"
        >**DEBUG** SET STEP</button>-->
        <button
            class="debugButton"
            v-if="isDebugMode"
            @click="setRoomState({currentStep: { name: 'NEXT' }})"
        >NEXT STEP</button>

        <!-- <button
			class="debugButton"
			v-if="isDebugMode"
			@click="setRoomState({currentStep: {name:'global_intro'}})"
		>global_intro</button>
		<button
			class="debugButton"
			v-if="isDebugMode && !isMobile"
			@click="setRoomState({currentStep: {name:'global_ending'}})"
        >global_ending</button>-->

        <!-- <button class="debugButton" v-if="isDebugMode" @click="logTrial1Victorious()">Who wins?</button> -->
        <!-- <button
            class="debugButton"
            v-if="isDebugMode"
            @click="emitToBus('trigger ending', 'team')"
        >team wins</button> -->
        <!-- <button
            class="debugButton"
            v-if="isDebugMode"
            @click="emitToBus('trigger ending', 'lamar')"
        >cyan wins</button> -->
        <!-- 
		<div>
			<span>Desktop Users: {{desktopUsersCount}}</span>
			<span>Mobile Users: {{mobileUsersCount}}</span>
			<span>Current Step: {{roomState.currentStep}}</span>
        </div>-->
    </div>
</template>

<script>
import { bus } from "../main";

export default {
    name: "DebugUIHelpers",
    components: {},
    props: {
        roomId: String,
        isMobile: Boolean,
        users: Array,
        roomState: Object
    },
    data: function() {
        return {
            isDebugMode: true
        };
    },
    computed: {
        desktopUsersCount() {
            return this.$props.users.filter(user => !user.isMobile).length;
        },
        mobileUsersCount() {
            return this.$props.users.filter(user => user.isMobile).length;
        }
    },
    methods: {
        setRoomState(stateObj) {
            bus.$emit("setRoomState", stateObj);
        },
        // logTrial1Victorious() {
        // 	bus.$emit("logTrial1Victorious");
        // },
        emitToBus(eventName, passedParam) {
            bus.$emit(eventName, passedParam);
        }
    }
};
</script>

<style scoped lang="scss">
.debugUI {
    pointer-events: none;
    position: absolute;
    bottom: 25px;
    right: 0;
    z-index: 1000;
    font-size: 10px;
    opacity: 0;

    span {
        margin-right: 10px;
    }

    .debugButton {
        pointer-events: auto;
        margin-right: 22px;
        margin-bottom: 5px;
        color: #0f0;
        background: #000;
        padding: 50px 25px;
        display: inline-block;
    }
}
</style>
