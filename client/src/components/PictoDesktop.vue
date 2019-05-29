<template>
    <img class="picto" :class="isActive ? 'active' : ''" src="/assets/img/icon-desktop.svg">
</template>

<script>
export default {
    name: "PictoDesktop",
    props: {
        isActive: { type: Boolean, default: true }
    }
}
</script>

<style lang="scss" scoped>
@import "@/config/styles.scss";

.picto {
    height: 100px;
    opacity: 0.1;
    transition: all 0.4s ease;
}
.active {
    opacity: 1;
    @extend .svgGlow;
}
</style>

