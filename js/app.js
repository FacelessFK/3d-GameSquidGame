const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xb7c3f3, 1);

const light = new THREE.AmbientLight(0xfffff);
scene.add(light);

const startPosition = 3;
const endPosition = -startPosition;
const text = document.querySelector(".text");
const runBtn = document.querySelector(".btn");
const timeLimit = 10;

let gameStat = "loading";

let isLookingBackward = true;

function createCube(size, positionX, rotY = 0, color = 0xfbc851) {
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = positionX;
    cube.rotation.y = rotY;
    scene.add(cube);
    return cube;
}

camera.position.z = 5;

const loader = new THREE.GLTFLoader();

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class Doll {
    constructor() {
        loader.load("../addOn/modal/scene.gltf", (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(0.4, 0.39, 0.4);
            gltf.scene.position.set(-6, -0, -2);

            this.doll = gltf.scene;
        });
    }

    lookBackward() {
        // this.doll.rotation.y = -3.15;
        gsap.to(this.doll.rotation, { y: -1.4, duration: 0.45 });
        setTimeout(() => (isLookingBackward = true), 150);
    }

    lookForward() {
        gsap.to(this.doll.rotation, { y: -4.5, duration: 0.45 });
        setTimeout(() => (isLookingBackward = false), 450);
    }

    async start() {
        this.lookBackward();
        await delay(Math.random() * 1000 + 1000);
        this.lookForward(Math.random() * 750 + 750);
        await delay(1000);
        this.start();
    }
}

function creatTrack() {
    createCube(
        { w: startPosition * 2 + 0.2, h: 1.5, d: 1 },
        0,
        0,
        0xe5a716
    ).position.z = -1;
    createCube({ w: 0.2, h: 1.5, d: 1.5 }, startPosition, -0.35);
    createCube({ w: 0.2, h: 1.5, d: 1.5 }, endPosition, 0.35);
}
creatTrack();

class Player {
    constructor() {
        const geometry = new THREE.SphereGeometry(0.2, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.z = 1;
        sphere.position.x = startPosition;
        scene.add(sphere);
        this.player = sphere;
        this.playerInfo = {
            positionX: startPosition,
            velocity: 0
        };
    }
    run() {
        this.playerInfo.velocity = 0.03;
    }
    stop() {
        gsap.to(this.playerInfo, { velocity: 0, duration: 0.5 });
    }
    check() {
        if (this.playerInfo.velocity > 0 && !isLookingBackward) {
            text.innerText = "you lost!";
            gameStat = "over";
        }
        if (this.playerInfo.positionX < endPosition + 0.4) {
            text.innerText = "you won";
            gameStat = "over";
        }
    }
    update() {
        this.check();
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.player.position.x = this.playerInfo.positionX;
    }
}

const player = new Player();

// const sonic = new Sonic();
let doll = new Doll();

async function init() {
    await delay(500);
    text.innerText = "Starting in 3";
    await delay(500);
    text.innerText = "Starting in 2";
    await delay(500);
    text.innerText = "Starting in 1";
    await delay(500);
    text.innerText = "Goo!!!";
    startGame();
}

function startGame() {
    gameStat = "started";
    let progressBar = createCube({ w: 5, h: 0.1, d: 1 }, 0);
    progressBar.position.y = 3.35;
    gsap.to(progressBar.scale, { x: 0, duration: timeLimit, ease: "none" });
    doll.start();

    setTimeout(() => {
        if (gameStat != "over") {
            text.innerText = "times up, over, blaow";
            gameStat = "over";
        }
    }, timeLimit * 1000);
}

init();

function animate() {
    if (gameStat == "over") return;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    player.update();
}
animate();

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function active() {
    if (gameStat != "started") return;
    player.run();
}
function inert() {
    player.stop();
}

runBtn.addEventListener("mousedown", active);

runBtn.addEventListener("mouseup", inert);

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") active();
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") inert();
});
