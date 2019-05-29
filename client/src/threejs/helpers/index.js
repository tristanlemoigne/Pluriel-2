import * as THREE from "three"

function curveFromGeometry(geometry) {
    // console.log(rawCamPathGeometry)
    const rawXYZarr = geometry.attributes.position.array
    // const withoutDuplicatesXYZarr = [...new Set(rawXYZarr)] // this can break stuff (changing order of points ???)

    let camPathPoints = []
    for (let i = 0; i < rawXYZarr.length / 3; i++) {
        camPathPoints[i] = new THREE.Vector3(
            rawXYZarr[i * 3], // x
            rawXYZarr[i * 3 + 1], // y
            rawXYZarr[i * 3 + 2] // z
        )
    }
    return new THREE.CatmullRomCurve3(camPathPoints, false)
}

/**
 * Look inside group of objects, find all objects matching with the passed string, and call the function
 * @param {*} group Any Threejs object with children
 * @param {string} nameOfObj Part of the name of the objects we want
 * @param {function} callback The action we want to do on the found objects
 */
function applyFuncOnObjs(group, nameOfObj, callback) {
    if (!group.children) return
    if (group.constructor.name.includes(nameOfObj)) {
        callback(group)
    }
    group.children.map(child => {
        if (child.constructor.name.includes(nameOfObj)) {
            callback(child)
        }
        if (child.children.length > 0) {
            applyFuncOnObjs(child, nameOfObj, callback)
        }
    })
}

export { curveFromGeometry, applyFuncOnObjs }
