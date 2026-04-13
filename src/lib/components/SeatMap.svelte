<script lang="ts">
	import { onMount } from 'svelte';

	let { 
		width = 438, 
		height = 347, 
		selectedSeat = null,
		occupancy = 'low' as 'low' | 'medium' | 'high',
		onSelect = (_seat: { x: number; y: number }) => {}
	}: {
		width?: number;
		height?: number;
		selectedSeat: { x: number; y: number } | null;
		occupancy?: 'low' | 'medium' | 'high';
		onSelect?: (seat: { x: number; y: number }) => void;
	} = $props();

	const occupancyImages = {
		low: '/seating-map-low.png',
		medium: '/seating-map-medium.png',
		high: '/seating-map-high.png'
	};

	let canvas: HTMLCanvasElement = $state() as HTMLCanvasElement;
	let overlayCanvas: HTMLCanvasElement = $state() as HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let overlayCtx: CanvasRenderingContext2D | null = null;
	let imageLoaded = $state(false);
	let img: HTMLImageElement;
	let hoveredRegionId = $state<string | null>(null);

	interface ClickableRegion {
		id: string;
		x: number;
		y: number;
		w: number;
		h: number;
		type: 'chair' | 'bench';
	}

	const regions: ClickableRegion[] = [
		{ id: "bench-1", x: 29.75, y: 44.19921875, w: 79, h: 8, type: "bench" },
		{ id: "bench-2", x: 29.75, y: 81.19921875, w: 78, h: 10, type: "bench" },
		{ id: "bench-3", x: 29, y: 100.296875, w: 79, h: 8, type: "bench" },
		{ id: "bench-4", x: 29, y: 139.296875, w: 79, h: 10, type: "bench" },
		{ id: "bench-5", x: 31, y: 155.296875, w: 78, h: 10, type: "bench" },
		{ id: "bench-6", x: 28, y: 195.296875, w: 78, h: 11, type: "bench" },
		{ id: "bench-7", x: 29, y: 212.296875, w: 77, h: 10, type: "bench" },
		{ id: "bench-8", x: 29, y: 252.296875, w: 79, h: 10, type: "bench" },
		{ id: "bench-9", x: 29, y: 269.296875, w: 77, h: 8, type: "bench" },
		{ id: "bench-10", x: 29, y: 307.296875, w: 75, h: 10, type: "bench" },
		{ id: "bench-11", x: 341, y: 311.296875, w: 77, h: 8, type: "bench" },
		{ id: "bench-12", x: 340, y: 269.296875, w: 79, h: 8, type: "bench" },
		{ id: "bench-13", x: 338, y: 251.8968734741211, w: 81, h: 11, type: "bench" },
		{ id: "bench-14", x: 339, y: 211.8968734741211, w: 79, h: 11, type: "bench" },
		{ id: "bench-15", x: 341, y: 194.8968734741211, w: 78, h: 11, type: "bench" },
		{ id: "bench-16", x: 338, y: 156.8968734741211, w: 82, h: 9, type: "bench" },
		{ id: "bench-17", x: 341, y: 139.8968734741211, w: 77, h: 9, type: "bench" },
		{ id: "bench-18", x: 341, y: 99.8968734741211, w: 78, h: 10, type: "bench" },
		{ id: "bench-19", x: 341, y: 82.8968734741211, w: 77, h: 9, type: "bench" },
		{ id: "bench-20", x: 340, y: 42.896873474121094, w: 78, h: 9, type: "bench" },
		{ id: "chair-21", x: 180, y: 55.896873474121094, w: 16, h: 7, type: "chair" },
		{ id: "chair-22", x: 200, y: 54.896873474121094, w: 14, h: 8, type: "chair" },
		{ id: "chair-23", x: 217, y: 55.896873474121094, w: 14, h: 8, type: "chair" },
		{ id: "chair-24", x: 236, y: 55.896873474121094, w: 16, h: 7, type: "chair" },
		{ id: "chair-25", x: 255, y: 54.896873474121094, w: 14, h: 8, type: "chair" },
		{ id: "chair-26", x: 257, y: 95.8968734741211, w: 12, h: 6, type: "chair" },
		{ id: "chair-27", x: 239, y: 92.8968734741211, w: 13, h: 12, type: "chair" },
		{ id: "chair-28", x: 219, y: 92.8968734741211, w: 14, h: 11, type: "chair" },
		{ id: "chair-29", x: 199, y: 92.8968734741211, w: 15, h: 12, type: "chair" },
		{ id: "chair-30", x: 181, y: 94.8968734741211, w: 14, h: 10, type: "chair" },
		{ id: "chair-31", x: 179, y: 121.8968734741211, w: 15, h: 11, type: "chair" },
		{ id: "chair-32", x: 198, y: 121.8968734741211, w: 14, h: 11, type: "chair" },
		{ id: "chair-33", x: 218, y: 122.8968734741211, w: 13, h: 9, type: "chair" },
		{ id: "chair-34", x: 235, y: 123.8968734741211, w: 17, h: 9, type: "chair" },
		{ id: "chair-35", x: 256, y: 123.8968734741211, w: 16, h: 8, type: "chair" },
		{ id: "chair-36", x: 256, y: 163.8968734741211, w: 13, h: 8, type: "chair" },
		{ id: "chair-37", x: 237, y: 161.8968734741211, w: 11, h: 9, type: "chair" },
		{ id: "chair-38", x: 217, y: 162.8968734741211, w: 14, h: 9, type: "chair" },
		{ id: "chair-39", x: 199, y: 163.8968734741211, w: 14, h: 8, type: "chair" },
		{ id: "chair-40", x: 181, y: 163.8968734741211, w: 11, h: 8, type: "chair" },
		{ id: "chair-41", x: 181, y: 188.49687576293945, w: 16, h: 11, type: "chair" },
		{ id: "chair-42", x: 198, y: 190.49687576293945, w: 16, h: 10, type: "chair" },
		{ id: "chair-43", x: 217, y: 192.49687576293945, w: 15, h: 7, type: "chair" },
		{ id: "chair-44", x: 237, y: 192.49687576293945, w: 16, h: 6, type: "chair" },
		{ id: "chair-45", x: 257, y: 192.49687576293945, w: 13, h: 8, type: "chair" },
		{ id: "chair-46", x: 178, y: 228.49687576293945, w: 15, h: 9, type: "chair" },
		{ id: "chair-47", x: 199, y: 230.49687576293945, w: 16, h: 9, type: "chair" },
		{ id: "chair-48", x: 218, y: 229.49687576293945, w: 16, h: 11, type: "chair" },
		{ id: "chair-49", x: 235, y: 230.49687576293945, w: 15, h: 10, type: "chair" },
		{ id: "chair-50", x: 256, y: 232.49687576293945, w: 14, h: 9, type: "chair" },
		{ id: "chair-51", x: 180, y: 259.49687576293945, w: 14, h: 9, type: "chair" },
		{ id: "chair-52", x: 200, y: 259.49687576293945, w: 13, h: 10, type: "chair" },
		{ id: "chair-53", x: 218, y: 260.49687576293945, w: 15, h: 8, type: "chair" },
		{ id: "chair-54", x: 237, y: 259.49687576293945, w: 15, h: 8, type: "chair" },
		{ id: "chair-55", x: 257, y: 260.49687576293945, w: 13, h: 9, type: "chair" },
		{ id: "chair-56", x: 255, y: 298.49687576293945, w: 14, h: 10, type: "chair" },
		{ id: "chair-57", x: 236, y: 300.49687576293945, w: 14, h: 8, type: "chair" },
		{ id: "chair-58", x: 216, y: 299.49687576293945, w: 15, h: 11, type: "chair" },
		{ id: "chair-59", x: 198, y: 299.49687576293945, w: 15, h: 9, type: "chair" },
		{ id: "chair-60", x: 178, y: 299.49687576293945, w: 14, h: 8, type: "chair" }
	];

	function getMousePos(e: MouseEvent): { x: number; y: number } {
		if (!overlayCanvas) return { x: 0, y: 0 };
		const rect = overlayCanvas.getBoundingClientRect();
		const scaleX = width / rect.width;
		const scaleY = height / rect.height;
		return {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY
		};
	}

	function drawImage() {
		if (!ctx || !imageLoaded) return;
		ctx.drawImage(img, 0, 0, width, height);
	}

	function drawOverlay() {
		if (!overlayCtx) return;
		const c = overlayCtx;
		
		c.clearRect(0, 0, width, height);

		regions.forEach(region => {
			const isHovered = hoveredRegionId === region.id;
			const isSelected = selectedSeat && 
				Math.abs(selectedSeat.x * width - region.x - region.w/2) < region.w &&
				Math.abs(selectedSeat.y * height - region.y - region.h/2) < region.h;

			if (isSelected || isHovered) {
				c.strokeStyle = isSelected ? '#4caf50' : '#ff9800';
				c.lineWidth = isSelected ? 2 : 1;
				c.fillStyle = isSelected ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 152, 0, 0.3)';
				c.fillRect(region.x, region.y, region.w, region.h);
				c.strokeRect(region.x, region.y, region.w, region.h);
			}
		});
	}

	function handleMouseMove(e: MouseEvent) {
		if (!overlayCanvas) return;
		
		const pos = getMousePos(e);
		hoveredRegionId = null;

		for (const region of regions) {
			if (pos.x >= region.x && pos.x <= region.x + region.w &&
				pos.y >= region.y && pos.y <= region.y + region.h) {
				hoveredRegionId = region.id;
				break;
			}
		}

		drawOverlay();
	}

	function handleClick(e: MouseEvent) {
		if (!overlayCanvas) return;
		
		const pos = getMousePos(e);

		for (const region of regions) {
			if (pos.x >= region.x && pos.x <= region.x + region.w &&
				pos.y >= region.y && pos.y <= region.y + region.h) {
				selectedSeat = { 
					x: (region.x + region.w / 2) / width, 
					y: (region.y + region.h / 2) / height 
				};
				onSelect(selectedSeat);
				drawOverlay();
				break;
			}
		}
	}

	function handleMouseLeave() {
		hoveredRegionId = null;
		drawOverlay();
	}

	$effect(() => {
		if (overlayCtx) {
			drawOverlay();
		}
	});

	$effect(() => {
		if (ctx && imageLoaded) {
			drawImage();
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
			drawImage();
			drawOverlay();
		};
		img.onerror = () => {
			console.error('Failed to load seating map image');
		};
		img.src = occupancyImages[occupancy];
	});

	$effect(() => {
		if (img && occupancy) {
			imageLoaded = false;
			img.src = occupancyImages[occupancy];
		}
	});
</script>

<div class="seat-map-container">
	<div class="map-wrapper" style="width: {width}px; height: {height}px;">
		<canvas bind:this={canvas} {width} {height} class="base-canvas"></canvas>
		<canvas
			bind:this={overlayCanvas}
			{width}
			{height}
			class="overlay-canvas"
			onclick={handleClick}
			onmousemove={handleMouseMove}
			onmouseleave={handleMouseLeave}
		></canvas>
	</div>
	
	<p class="hint">
		{#if hoveredRegionId}
			{hoveredRegionId} - click to select
		{:else}
			{regions.length} clickable regions ({regions.filter(r => r.type === 'chair').length} chairs, {regions.filter(r => r.type === 'bench').length} benches)
		{/if}
	</p>
</div>

<style>
	.seat-map-container {
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
		cursor: pointer;
	}

	.hint {
		color: #888;
		font-size: 14px;
	}
</style>
