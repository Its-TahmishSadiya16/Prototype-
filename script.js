document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

   
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

   
    const ballGroup = new THREE.Group();
    const numBalls = 110;
    const ballSize = 2;
    let scatter = false;
    let scatterTransition = false;

    function createBall(size, color) {
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color });
        const ball = new THREE.Mesh(geometry, material);
        return ball;
    }

    function getInfinityPosition(t) {
        const a = 20;
        const b = 10;
        const x = a * Math.sin(t);
        const y = b * Math.sin(2 * t);
        return { x, y, z: 0 };
    }

    const balls = [];
    for (let i = 0; i < numBalls; i++) {
        const ball = createBall(ballSize, 0xff0000);
        const t = (i / numBalls) * Math.PI * 4;
        const pos = getInfinityPosition(t);
        ball.position.set(pos.x, pos.y, pos.z);
        ball.initialPosition = { ...pos };
        ball.velocity = { x: (Math.random() - 0.5) * 0.4, y: (Math.random() - 0.5) * 0.4, z: (Math.random() - 0.5) * 0.4 };
        ballGroup.add(ball);
        balls.push(ball);
    }

    scene.add(ballGroup);

    camera.position.z = 50;

    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    popup.style.padding = '10px';
    popup.style.border = '1px solid #ff0000';
    popup.style.display = 'none';
    document.body.appendChild(popup);

    function animate() {
        requestAnimationFrame(animate);

        if (!scatter) {
            ballGroup.rotation.z += 0.002;
        }

        if (scatter) {
          
            balls.forEach((ball) => {
                ball.position.x += ball.velocity.x;
                ball.position.y += ball.velocity.y;
                ball.position.z += ball.velocity.z;

                if (ball.position.x > window.innerWidth / 2 || ball.position.x < -window.innerWidth / 2) ball.velocity.x *= -1;
                if (ball.position.y > window.innerHeight / 2 || ball.position.y < -window.innerHeight / 2) ball.velocity.y *= -1;
                if (ball.position.z > 50 || ball.position.z < -50) ball.velocity.z *= -1;

                if (ball.position.x > window.innerWidth) ball.position.x = -window.innerWidth;
                if (ball.position.x < -window.innerWidth) ball.position.x = window.innerWidth;
                if (ball.position.y > window.innerHeight) ball.position.y = -window.innerHeight;
                if (ball.position.y < -window.innerHeight) ball.position.y = window.innerHeight;

                const scatterFactor = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 10;
                ball.scale.set(1 + scatterFactor / 10, 1 + scatterFactor / 10, 1 + scatterFactor / 10);
            });
        } else if (scatterTransition) {
    
            balls.forEach((ball, index) => {
                const t = (index / numBalls) * Math.PI * 4;
                const targetPos = getInfinityPosition(t);
                ball.position.lerp(targetPos, 0.1); 
                ball.scale.set(1, 1, 1); 
            });

            
            if (balls.every(ball => {
                const t = (balls.indexOf(ball) / numBalls) * Math.PI * 4;
                const targetPos = getInfinityPosition(t);
                return ball.position.distanceTo(new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)) < 0.1;
            })) {
                scatterTransition = false;
            }
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        scatter = scrollY > 0;
        scatterTransition = !scatter && scrollY === 0;
    });

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.updateMatrixWorld();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(balls);

        if (intersects.length > 0) {
            const intersectedBall = intersects[0].object;
            popup.innerText = `Ball Position: (${Math.round(intersectedBall.position.x)}, ${Math.round(intersectedBall.position.y)}, ${Math.round(intersectedBall.position.z)})`;
            popup.style.left = `${event.clientX + 10}px`;
            popup.style.top = `${event.clientY + 10}px`;
            popup.style.display = 'block';
        } else {
            popup.style.display = 'none';
        }
    }

    window.addEventListener('mousemove', onMouseMove);
});




















    





























