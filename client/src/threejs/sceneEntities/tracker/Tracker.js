function Tracker(video) {
    const tracker = new tracking.ColorTracker(["cyan", "magenta"])
    let cyanBlob, pinkBlob

    function onTrack(callback) {
        tracking.track(video, tracker, { camera: true })
        tracker.on("track", event => {
            if (event.data.length > 0) {
                const cyanBlobs = event.data.filter(
                    blob => blob.color === "cyan"
                )
                const pinkBlobs = event.data.filter(
                    blob => blob.color === "magenta"
                )

                // console.log({ cyanBlobs })
                if (cyanBlobs.length > 0) {
                    // console.log("tracking cyan")
                    if (cyanBlobs.length === 1) {
                        cyanBlob = cyanBlobs[0]
                    } else if (cyanBlobs.length > 1) {
                        cyanBlob = getAverageBlob(cyanBlobs)
                    }
                }

                // console.log({ pinkBlobs })
                if (pinkBlobs.length > 0) {
                    // console.log("tracking magenta")
                    if (pinkBlobs.length === 1) {
                        pinkBlob = pinkBlobs[0]
                    } else if (pinkBlobs.length > 1) {
                        pinkBlob = getAverageBlob(pinkBlobs)
                    }
                }

                callback({ cyanBlob, pinkBlob })
            }
        })
    }

    function getAverageBlob(blobsArray) {
        const averageBlob = blobsArray.reduce((prevBlob, currBlob) => ({
            x: prevBlob.x + currBlob.x,
            y: prevBlob.y + currBlob.y,
            width: prevBlob.width + currBlob.width,
            height: prevBlob.height + currBlob.height
        }))

        Object.keys(averageBlob).map(key => {
            averageBlob[key] /= blobsArray.length
        })

        return averageBlob
    }

    return {
        onTrack
    }
}

export default Tracker
