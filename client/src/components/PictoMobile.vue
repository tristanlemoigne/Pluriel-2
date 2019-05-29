<template>
    <img class="picto" :class="isActive ? 'active' : ''" src="/assets/img/icon-mobile.svg">
</template>

<script>
export default {
    name: "PictoMobile",
    props: {
        isActive: { type: Boolean, default: true }
    }
}
</script>

<style lang="scss" scoped>
@import "@/config/styles.scss";

.picto {
    margin-top: 30px;
    height: 80px;
    opacity: 0.5;
    transition: 0.5s ease;
}
.active {
    opacity: 1;
    @extend .svgGlow;
}
</style>

