function CanvasRotator(canvas, camera, customRenderer) {
    function rotateCanvas(angle) {
        // https://stackoverflow.com/questions/33866535/how-to-scale-a-rotated-rectangle-to-always-fit-another-rectangle
        // Set rotation
        // canvas.style.transform = `translate(-50%, -50%) rotate(${canvasAngle}rad)`
        canvas.style.transform = `rotate(${angle}rad)`

        const boundingX =
            window.innerWidth * Math.abs(Math.cos(angle)) +
            window.innerHeight * Math.abs(Math.sin(angle))

        const boundingY =
            window.innerWidth * Math.abs(Math.sin(angle)) +
            window.innerHeight * Math.abs(Math.cos(angle))

        customRenderer.setSize(boundingX, boundingY)
        camera.aspect = canvas.width / canvas.height
        camera.updateProjectionMatrix()
    }

    function rotateCSS(el, angle) {
        el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`
    }

    function moveSlider(e, angle) {
        let sliderPos

        if (e.pageX >= 0) {
            sliderPos =
                (window.innerWidth / 2 +
                    (e.pageX - window.innerWidth / 2) * 0.45) *
                    Math.abs(Math.cos(angle)) +
                (window.innerHeight / 2) * Math.abs(Math.sin(angle))
            // e.pageX * Math.abs(Math.cos(angle)) +
            // (window.innerHeight / 2) * Math.abs(Math.sin(angle))
        } else {
            sliderPos =
                e.touches[0].pageX * Math.abs(Math.cos(angle)) +
                e.touches[0].pageY * Math.abs(Math.sin(angle))
        }

        return sliderPos
    }

    return {
        rotateCanvas,
        rotateCSS,
        moveSlider
    }
}

export default CanvasRotator
