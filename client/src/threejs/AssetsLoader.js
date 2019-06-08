import { TextureLoader } from "three"
import { reject } from "q"
import GLTFLoader from "three-gltf-loader"
import { OBJLoader } from "three-obj-mtl-loader"
import SVGLoader from "three-svg-loader"
import * as THREE from "three"

// const FBXLoader = require('three-fbx-loader');
const FBXLoader = require("three-fbxloader-offical")

function AssetsLoader() {
    this.assets = {}
    this._promises = []
    this._GLTFLoader = new GLTFLoader()
    this._OBJLoader = new OBJLoader()
    this._FBXLoader = new FBXLoader()
    this._TextureLoader = new TextureLoader()
    this._SVGLoader = new SVGLoader()

    this.load = function(path, ref, childArr) {
        const extension = path.substr(path.indexOf("."))
        // console.log('chemin', path)

        if (extension === ".gltf" || extension === ".glb") {
            this._promises.push(this._loadGLTF(path, ref, childArr))
        } else if (extension === ".obj") {
            this._promises.push(this._loadOBJ(path, ref))
        } else if (extension === ".fbx") {
            this._promises.push(this._loadFBX(path, ref))
        } else if (extension === ".png" || extension === ".jpg") {
            this._promises.push(this._loadTexture(path, ref))
        } else if (extension === ".svg") {
            this._promises.push(this._loadSVG(path, ref))
        }
    }

    this._loadGLTF = function(path, ref, childArr) {
        console.log(path, ref)
        return new Promise((resolve, reject) => {
            if (path && ref) {
                this._GLTFLoader.load(path, gltf => {
                    if (childArr) {
                        let object = gltf

                        childArr.forEach((child, index) => {
                            object = object[child]
                        })

                        this.assets[ref] = object
                    } else {
                        this.assets[ref] = gltf
                    }
                    console.log("resolved:", ref)
                    resolve()
                })
            } else {
                reject("Can't load GLTF")
            }
        })
    }

    this._loadOBJ = function(path, ref) {
        console.log(path, ref)
        return new Promise((resolve, reject) => {
            if (path && ref) {
                this._OBJLoader.load(path, obj => {
                    this.assets[ref] = obj
                    console.log("resolved:", ref)
                    resolve()
                })
            } else {
                reject("Can't load OBJ")
            }
        })
    }

    this._loadFBX = function(path, ref) {
        console.log(path, ref)
        return new Promise((resolve, reject) => {
            if (path && ref) {
                this._FBXLoader.load(path, fbx => {
                    this.assets[ref] = fbx
                    console.log("resolved:", ref)
                    resolve()
                })
            } else {
                reject("Can't load FBX")
            }
        })
    }

    this._loadTexture = function(path, ref) {
        console.log(path, ref)
        if (path && ref) {
            return new Promise(resolve => {
                const texture = this._TextureLoader.load(path)
                this.assets[ref] = texture
                console.log("resolved:", ref)
                resolve()
            })
        } else {
            reject("Can't load texture")
        }
    }

    this._loadSVG = function(path, ref) {
        console.log(path, ref)
        return new Promise((resolve, reject) => {
            if (path && ref) {
                // console.log("load svg")
                this._SVGLoader.load(path, svg => {
                    var group = new THREE.Group()
                    var paths = svg.paths

                    for (var i = 0; i < paths.length; i++) {
                        var path = paths[i]

                        var material = new THREE.MeshBasicMaterial({
                            color: path.color,
                            side: THREE.DoubleSide
                            // depthWrite: false
                        })

                        var shapes = path.toShapes(true)

                        for (var j = 0; j < shapes.length; j++) {
                            var shape = shapes[j]
                            var geometry = new THREE.ShapeBufferGeometry(shape)
                            var mesh = new THREE.Mesh(geometry, material)
                            group.add(mesh)
                        }
                    }

                    this.assets[ref] = group
                    console.log("resolved:", ref)
                    resolve()
                })
            } else {
                reject("Can't load SVG")
            }
        })
    }

    this.onComplete = function(callback) {
        console.log("this._promises:", this._promises)
        Promise.all(this._promises)
            .then(() => {
                callback(this.assets)
            })
            .catch(error => {
                console.error("A promise has failed : ", error)
            })
    }
}

export default AssetsLoader
