<template>
	<div id="container">
		<div id="animate"></div>
	</div>
</template>

<script setup>
	import { onMounted, ref, watch } from 'vue';

	// Define props
	const props = defineProps({
		emojis: {
			type: Array,
			required: true,
		},
		speed: {
			type: Number,
			required: true,
		},
		density: {
			type: Number,
			required: true,
		},
		spawn: {
			type: Boolean,
			required: true,
		},
	});

	const circles = ref([]);

	// Function to create a new Circle and add it to the circles array
	function addCircle(delay, range, emoji) {
		setTimeout(() => {
			if(!props.spawn) return; // Check if spawning is allowed

			const fontSize = Math.random() * 20 + 20; // Random font size between 20px and 40px
			const blurAmount = Math.max(0, 2 - (fontSize - 20) / 10); // Calculate blur based on font size

			const circle = new Circle(
				range[0] + Math.random() * range[1],
				-Math.random() * 100, // Spawn outside the viewport
				emoji,
				{ x: -0.15 + Math.random() * 0.3, y: props.speed + Math.random() },
				range,
				Math.random() * 360, // Random initial rotation
				fontSize,
				blurAmount, // Pass blur amount
			);
			circles.value.push(circle);
		}, delay);
	}

	// Circle class to define individual emoji behavior
	class Circle {
		constructor(x, y, emoji, velocity, range, rotation, fontSize, blurAmount) {
			this.x = x;
			this.y = y;
			this.emoji = emoji;
			this.velocity = velocity;
			this.range = range;
			this.rotation = rotation;
			this.fontSize = fontSize;
			this.blurAmount = blurAmount;
			this.element = document.createElement('span');
			this.element.style.display = 'block';
			this.element.style.opacity = 0;
			this.element.style.position = 'absolute';
			this.element.style.fontSize = `${ fontSize }px`;
			this.element.style.filter = `blur(${ blurAmount }px)`;
			this.element.innerHTML = emoji;
			document.getElementById('animate').appendChild(this.element);
		}

		update(containerHeight) {
			if(this.y > containerHeight + 100) {
				if(props.spawn) {
					this.y = -Math.random() * 100; // Reset to outside the viewport
					this.x = this.range[0] + Math.random() * this.range[1];
					this.rotation = Math.random() * 360; // Reset rotation
				}
			}

			this.y += this.velocity.y;
			this.x += this.velocity.x;
			this.rotation += 1; // Increment rotation for animation
			this.element.style.opacity = 1;
			this.element.style.transform = `translate3d(${ this.x }px, ${ this.y }px, 0) rotate(${ this.rotation }deg)`;

			// set the zIndex based in the fontSize
			this.element.style.zIndex = Math.floor(this.fontSize);
		}
	}

	// Initialize circles with specified positions and delays
	const initializeCircles = () => {
		circles.value = []; // Clear existing circles
		for(let i = 0; i < props.density; i++) {
			addCircle(i * 150, [ 10, 300 ], props.emojis[Math.floor(Math.random() * props.emojis.length)]);
			addCircle(i * 150, [ 10, -300 ], props.emojis[Math.floor(Math.random() * props.emojis.length)]);
			addCircle(i * 150, [ 10 - 200, -300 ], props.emojis[Math.floor(Math.random() * props.emojis.length)]);
			addCircle(i * 150, [ 10 + 200, 300 ], props.emojis[Math.floor(Math.random() * props.emojis.length)]);
			addCircle(i * 150, [ 10 - 400, -300 ], props.emojis[Math.floor(Math.random() * props.emojis.length)]);
			addCircle(i * 150, [ 10 + 400, 300 ], props.emojis[Math.floor(Math.random() * props.emojis.length)]);
			addCircle(i * 150, [ 10 - 600, -300 ], props.emojis[Math.floor(Math.random() * props.emojis.length)]);
			addCircle(i * 150, [ 10 + 600, 300 ], props.emojis[Math.floor(Math.random() * props.emojis.length)]);
		}
	};

	// Animation loop to update circle positions
	const animate = () => {
		const container = document.getElementById('container');
		const containerHeight = container.offsetHeight;

		circles.value.forEach(circle => circle.update(containerHeight));

		requestAnimationFrame(animate);
	};

	onMounted(() => {
		initializeCircles();
		animate();
	});

	watch(() => [ props.emojis, props.speed, props.density, props.spawn ], () => {
		if(props.spawn) {
			initializeCircles();
		}
	});
</script>

<style scoped>
	#container {
		left: 0;
		position: absolute;
		width: 100%;
		top: -100px;
		height: calc(100vh + 100px);
		overflow: hidden;
	}

	#animate {
		margin: 0 auto;
		width: 20px;
		overflow: visible;
		position: relative;
	}
</style>
