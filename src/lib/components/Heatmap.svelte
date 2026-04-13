<script lang="ts">
	import { onMount } from 'svelte';

	let { seats = [], width = 438, height = 347, previewMode = false }: {
		seats: { x: number; y: number }[];
		width?: number;
		height?: number;
		previewMode?: boolean;
	} = $props();

	let canvas: HTMLCanvasElement = $state() as HTMLCanvasElement;
	let overlayCanvas: HTMLCanvasElement = $state() as HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let overlayCtx: CanvasRenderingContext2D | null = null;
	let imageLoaded = $state(false);
	let img: HTMLImageElement;
	let ready = $state(false);

	const gaussianKernel = [
		1, 4, 7, 4, 1,
		4, 16, 26, 16, 4,
		7, 26, 41, 26, 7,
		4, 16, 26, 16, 4,
		1, 4, 7, 4, 1
	];

	function normalizeKernel() {
		const sum = gaussianKernel.reduce((a, b) => a + b, 0);
		return gaussianKernel.map(v => v / sum);
	}

	function drawImage() {
		if (!ctx || !imageLoaded || !ready) return;
		ctx.drawImage(img, 0, 0, width, height);
	}

	function drawHeatmap() {
		if (!overlayCtx || !ready) return;
		
		overlayCtx.clearRect(0, 0, width, height);
		
		const currentSeats = previewMode ? [
			{ x: 0.3, y: 0.4 },
			{ x: 0.35, y: 0.45 },
			{ x: 0.4, y: 0.5 },
			{ x: 0.6, y: 0.4 },
			{ x: 0.65, y: 0.45 },
			{ x: 0.7, y: 0.5 },
			{ x: 0.5, y: 0.3 }
		] : seats;
		
		if (currentSeats.length === 0) {
			overlayCtx.fillStyle = '#888';
			overlayCtx.font = '14px sans-serif';
			overlayCtx.textAlign = 'center';
			overlayCtx.fillText('No data yet', width / 2, height / 2);
			return;
		}

		const normalizedKernel = normalizeKernel();
		const kernelSize = 5;
		const kernelHalf = Math.floor(kernelSize / 2);
		const heatData = new Float32Array(width * height);

		for (const seat of currentSeats) {
			const px = Math.floor(seat.x * width);
			const py = Math.floor(seat.y * height);

			for (let ky = -kernelHalf; ky <= kernelHalf; ky++) {
				for (let kx = -kernelHalf; kx <= kernelHalf; kx++) {
					const wx = px + kx;
					const wy = py + ky;
					if (wx >= 0 && wx < width && wy >= 0 && wy < height) {
						const ki = (ky + kernelHalf) * kernelSize + (kx + kernelHalf);
						heatData[wy * width + wx] += normalizedKernel[ki];
					}
				}
			}
		}

		const imageData = overlayCtx.createImageData(width, height);
		const maxVal = Math.max(...heatData);

		for (let i = 0; i < heatData.length; i++) {
			const intensity = maxVal > 0 ? heatData[i] / maxVal : 0;
			const idx = i * 4;

			if (intensity < 0.01) {
				imageData.data[idx] = 0;
				imageData.data[idx + 1] = 0;
				imageData.data[idx + 2] = 0;
				imageData.data[idx + 3] = 0;
			} else {
				imageData.data[idx] = Math.floor(intensity * 255);
				imageData.data[idx + 1] = Math.floor(Math.max(0, intensity - 0.5) * 2 * 255);
				imageData.data[idx + 2] = Math.floor(Math.max(0, 1 - intensity) * 255);
				imageData.data[idx + 3] = Math.floor(intensity * 200);
			}
		}

		overlayCtx.putImageData(imageData, 0, 0);

		for (const seat of currentSeats) {
			const px = seat.x * width;
			const py = seat.y * height;
			overlayCtx.beginPath();
			overlayCtx.arc(px, py, 4, 0, Math.PI * 2);
			overlayCtx.fillStyle = '#333';
			overlayCtx.fill();
		}
	}

	function render() {
		if (!ready) return;
		drawImage();
		drawHeatmap();
	}

	$effect(() => {
		if (ctx && overlayCtx) {
			ready = true;
			render();
		}
	});

	$effect(() => {
		if (ready && seats) {
			drawHeatmap();
		}
	});

	onMount(() => {
		if (canvas) {
			ctx = canvas.getContext('2d');
		}
		if (overlayCanvas) {
			overlayCtx = overlayCanvas.getContext('2d');
		}

		img = new Image();
		img.onload = () => {
			imageLoaded = true;
			if (ctx && overlayCtx) {
				ready = true;
			}
			render();
		};
		img.onerror = () => {
			console.error('Failed to load seating-map-low.png');
		};
		img.src = '/seating-map-low.png';
	});
</script>

<div class="heatmap-container">
	<div class="map-wrapper" style="width: {width}px; height: {height}px;">
		<canvas bind:this={canvas} {width} {height} class="base-canvas"></canvas>
		<canvas bind:this={overlayCanvas} {width} {height} class="overlay-canvas"></canvas>
	</div>
</div>

<style>
	.heatmap-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.map-wrapper {
		position: relative;
		border: 2px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
	}

	.base-canvas {
		display: block;
	}

	.overlay-canvas {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}
</style>
