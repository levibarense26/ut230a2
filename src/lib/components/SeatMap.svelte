<script lang="ts">
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

	let canvas: HTMLCanvasElement = $state() as HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
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
		{ id: "bench-1", x: 29.75, y: 44.2, w: 79, h: 8, type: "bench" },
		{ id: "bench-2", x: 29.75, y: 81.2, w: 78, h: 10, type: "bench" },
		{ id: "bench-3", x: 29, y: 100.3, w: 79, h: 8, type: "bench" },
		{ id: "bench-4", x: 29, y: 139.3, w: 79, h: 10, type: "bench" },
		{ id: "bench-5", x: 31, y: 155.3, w: 78, h: 10, type: "bench" },
		{ id: "bench-6", x: 28, y: 195.3, w: 78, h: 11, type: "bench" },
		{ id: "bench-7", x: 29, y: 212.3, w: 77, h: 10, type: "bench" },
		{ id: "bench-8", x: 29, y: 252.3, w: 79, h: 10, type: "bench" },
		{ id: "bench-9", x: 29, y: 269.3, w: 77, h: 8, type: "bench" },
		{ id: "bench-10", x: 29, y: 307.3, w: 75, h: 10, type: "bench" },
		{ id: "bench-11", x: 341, y: 311.3, w: 77, h: 8, type: "bench" },
		{ id: "bench-12", x: 340, y: 269.3, w: 79, h: 8, type: "bench" },
		{ id: "bench-13", x: 338, y: 251.9, w: 81, h: 11, type: "bench" },
		{ id: "bench-14", x: 339, y: 211.9, w: 79, h: 11, type: "bench" },
		{ id: "bench-15", x: 341, y: 194.9, w: 78, h: 11, type: "bench" },
		{ id: "bench-16", x: 338, y: 156.9, w: 82, h: 9, type: "bench" },
		{ id: "bench-17", x: 341, y: 139.9, w: 77, h: 9, type: "bench" },
		{ id: "bench-18", x: 341, y: 99.9, w: 78, h: 10, type: "bench" },
		{ id: "bench-19", x: 341, y: 82.9, w: 77, h: 9, type: "bench" },
		{ id: "bench-20", x: 340, y: 42.9, w: 78, h: 9, type: "bench" },
		{ id: "chair-21", x: 180, y: 55.9, w: 16, h: 7, type: "chair" },
		{ id: "chair-22", x: 200, y: 54.9, w: 14, h: 8, type: "chair" },
		{ id: "chair-23", x: 217, y: 55.9, w: 14, h: 8, type: "chair" },
		{ id: "chair-24", x: 236, y: 55.9, w: 16, h: 7, type: "chair" },
		{ id: "chair-25", x: 255, y: 54.9, w: 14, h: 8, type: "chair" },
		{ id: "chair-26", x: 257, y: 95.9, w: 12, h: 6, type: "chair" },
		{ id: "chair-27", x: 239, y: 92.9, w: 13, h: 12, type: "chair" },
		{ id: "chair-28", x: 219, y: 92.9, w: 14, h: 11, type: "chair" },
		{ id: "chair-29", x: 199, y: 92.9, w: 15, h: 12, type: "chair" },
		{ id: "chair-30", x: 181, y: 94.9, w: 14, h: 10, type: "chair" },
		{ id: "chair-31", x: 179, y: 121.9, w: 15, h: 11, type: "chair" },
		{ id: "chair-32", x: 198, y: 121.9, w: 14, h: 11, type: "chair" },
		{ id: "chair-33", x: 218, y: 122.9, w: 13, h: 9, type: "chair" },
		{ id: "chair-34", x: 235, y: 123.9, w: 17, h: 9, type: "chair" },
		{ id: "chair-35", x: 256, y: 123.9, w: 16, h: 8, type: "chair" },
		{ id: "chair-36", x: 256, y: 163.9, w: 13, h: 8, type: "chair" },
		{ id: "chair-37", x: 237, y: 161.9, w: 11, h: 9, type: "chair" },
		{ id: "chair-38", x: 217, y: 162.9, w: 14, h: 9, type: "chair" },
		{ id: "chair-39", x: 199, y: 163.9, w: 14, h: 8, type: "chair" },
		{ id: "chair-40", x: 181, y: 163.9, w: 11, h: 8, type: "chair" },
		{ id: "chair-41", x: 181, y: 188.5, w: 16, h: 11, type: "chair" },
		{ id: "chair-42", x: 198, y: 190.5, w: 16, h: 10, type: "chair" },
		{ id: "chair-43", x: 217, y: 192.5, w: 15, h: 7, type: "chair" },
		{ id: "chair-44", x: 237, y: 192.5, w: 16, h: 6, type: "chair" },
		{ id: "chair-45", x: 257, y: 192.5, w: 13, h: 8, type: "chair" },
		{ id: "chair-46", x: 178, y: 228.5, w: 15, h: 9, type: "chair" },
		{ id: "chair-47", x: 199, y: 230.5, w: 16, h: 9, type: "chair" },
		{ id: "chair-48", x: 218, y: 229.5, w: 16, h: 11, type: "chair" },
		{ id: "chair-49", x: 235, y: 230.5, w: 15, h: 10, type: "chair" },
		{ id: "chair-50", x: 256, y: 232.5, w: 14, h: 9, type: "chair" },
		{ id: "chair-51", x: 180, y: 259.5, w: 14, h: 9, type: "chair" },
		{ id: "chair-52", x: 200, y: 259.5, w: 13, h: 10, type: "chair" },
		{ id: "chair-53", x: 218, y: 260.5, w: 15, h: 8, type: "chair" },
		{ id: "chair-54", x: 237, y: 259.5, w: 15, h: 8, type: "chair" },
		{ id: "chair-55", x: 257, y: 260.5, w: 13, h: 9, type: "chair" },
		{ id: "chair-56", x: 255, y: 298.5, w: 14, h: 10, type: "chair" },
		{ id: "chair-57", x: 236, y: 300.5, w: 14, h: 8, type: "chair" },
		{ id: "chair-58", x: 216, y: 299.5, w: 15, h: 11, type: "chair" },
		{ id: "chair-59", x: 198, y: 299.5, w: 15, h: 9, type: "chair" },
		{ id: "chair-60", x: 178, y: 299.5, w: 14, h: 8, type: "chair" }
	];

	function getMousePos(e: MouseEvent): { x: number; y: number } {
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		const scaleX = width / rect.width;
		const scaleY = height / rect.height;
		return {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY
		};
	}

	function draw() {
		if (!ctx) return;
		const c = ctx;
		
		c.fillStyle = '#f5f5f5';
		c.fillRect(0, 0, width, height);

		regions.forEach(region => {
			const isHovered = hoveredRegionId === region.id;
			const isSelected = selectedSeat && 
				Math.abs(selectedSeat.x * width - region.x - region.w/2) < region.w &&
				Math.abs(selectedSeat.y * height - region.y - region.h/2) < region.h;

			if (isSelected) {
				c.fillStyle = 'rgba(76, 175, 80, 0.6)';
				c.strokeStyle = '#4caf50';
			} else if (isHovered) {
				c.fillStyle = 'rgba(255, 152, 0, 0.4)';
				c.strokeStyle = '#ff9800';
			} else {
				c.fillStyle = region.type === 'chair' ? 'rgba(100, 149, 237, 0.4)' : 'rgba(144, 238, 144, 0.4)';
				c.strokeStyle = region.type === 'chair' ? '#6495ed' : '#90ee90';
			}

			c.lineWidth = 1;
			c.fillRect(region.x, region.y, region.w, region.h);
			c.strokeRect(region.x, region.y, region.w, region.h);
		});
	}

	function handleMouseMove(e: MouseEvent) {
		const pos = getMousePos(e);
		hoveredRegionId = null;

		for (const region of regions) {
			if (pos.x >= region.x && pos.x <= region.x + region.w &&
				pos.y >= region.y && pos.y <= region.y + region.h) {
				hoveredRegionId = region.id;
				break;
			}
		}

		draw();
	}

	function handleClick(e: MouseEvent) {
		const pos = getMousePos(e);

		for (const region of regions) {
			if (pos.x >= region.x && pos.x <= region.x + region.w &&
				pos.y >= region.y && pos.y <= region.y + region.h) {
				selectedSeat = { 
					x: (region.x + region.w / 2) / width, 
					y: (region.y + region.h / 2) / height 
				};
				onSelect(selectedSeat);
				draw();
				break;
			}
		}
	}

	function handleMouseLeave() {
		hoveredRegionId = null;
		draw();
	}

	$effect(() => {
		draw();
	});

	$effect(() => {
		if (selectedSeat !== undefined) {
			draw();
		}
	});

	$effect(() => {
		if (hoveredRegionId !== undefined) {
			draw();
		}
	});

	$effect(() => {
		occupancy;
		draw();
	});

	import { onMount } from 'svelte';
	onMount(() => {
		if (canvas) {
			ctx = canvas.getContext('2d');
			draw();
		}
	});
</script>

<div class="seat-map-container">
	<div class="map-wrapper">
		<canvas 
			bind:this={canvas}
			{width}
			{height}
			onclick={handleClick}
			onmousemove={handleMouseMove}
			onmouseleave={handleMouseLeave}
		></canvas>
	</div>
	
	<p class="hint">
		{#if hoveredRegionId}
			{hoveredRegionId} - click to select
		{:else}
			{regions.filter(r => r.type === 'chair').length} chairs, {regions.filter(r => r.type === 'bench').length} benches - hover and click to select
		{/if}
	</p>
</div>

<style>
	.seat-map-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		width: 100%;
	}

	.map-wrapper {
		width: 100%;
		max-width: 438px;
		border: 2px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
	}

	canvas {
		display: block;
		width: 100%;
		height: auto;
		cursor: pointer;
	}

	.hint {
		color: #666;
		font-size: 14px;
		text-align: center;
	}
</style>
