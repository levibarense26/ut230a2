<script lang="ts">
	let {
		width = 550,
		height = 520,
		selectedSeat = null as { id: string; type: string } | null,
		occupancy = 'low' as 'low' | 'medium' | 'high',
		onSelect = (_seat: { id: string; type: string }) => {}
	}: {
		width?: number;
		height?: number;
		selectedSeat: { id: string; type: string } | null;
		occupancy?: 'low' | 'medium' | 'high';
		onSelect?: (seat: { id: string; type: string }) => void;
	} = $props();

	let editMode = $state(false);
	let hoveredId = $state<string | null>(null);
	let draggingId = $state<string | null>(null);
	let dragOffset = $state({ x: 0, y: 0 });

	interface SeatPosition {
		id: string;
		x: number;
		y: number;
		type: 'chair' | 'bench';
	}

	let seatPositions = $state<SeatPosition[]>([
		{ id: 'bench-1', x: 44, y: 99, type: 'bench' },
		{ id: 'bench-2', x: 48, y: 146, type: 'bench' },
		{ id: 'bench-3', x: 46, y: 167, type: 'bench' },
		{ id: 'bench-4', x: 46, y: 218, type: 'bench' },
		{ id: 'bench-5', x: 47, y: 239, type: 'bench' },
		{ id: 'bench-6', x: 48, y: 289, type: 'bench' },
		{ id: 'bench-7', x: 48, y: 310, type: 'bench' },
		{ id: 'bench-8', x: 51, y: 361, type: 'bench' },
		{ id: 'bench-9', x: 48, y: 381, type: 'bench' },
		{ id: 'bench-10', x: 46, y: 433, type: 'bench' },
		{ id: 'bench-11', x: 437, y: 97, type: 'bench' },
		{ id: 'bench-12', x: 437, y: 148, type: 'bench' },
		{ id: 'bench-13', x: 444, y: 168, type: 'bench' },
		{ id: 'bench-14', x: 445, y: 218, type: 'bench' },
		{ id: 'bench-15', x: 441, y: 240, type: 'bench' },
		{ id: 'bench-16', x: 444, y: 289, type: 'bench' },
		{ id: 'bench-17', x: 440, y: 312, type: 'bench' },
		{ id: 'bench-18', x: 444, y: 360, type: 'bench' },
		{ id: 'bench-19', x: 444, y: 382, type: 'bench' },
		{ id: 'bench-20', x: 444, y: 431, type: 'bench' },
		{ id: 'chair-1', x: 226, y: 110, type: 'chair' },
		{ id: 'chair-2', x: 249, y: 110, type: 'chair' },
		{ id: 'chair-3', x: 270, y: 111, type: 'chair' },
		{ id: 'chair-4', x: 318, y: 110, type: 'chair' },
		{ id: 'chair-5', x: 316, y: 159, type: 'chair' },
		{ id: 'chair-6', x: 226, y: 200, type: 'chair' },
		{ id: 'chair-7', x: 292, y: 111, type: 'chair' },
		{ id: 'chair-8', x: 248, y: 199, type: 'chair' },
		{ id: 'chair-9', x: 224, y: 157, type: 'chair' },
		{ id: 'chair-10', x: 294, y: 158, type: 'chair' },
		{ id: 'chair-11', x: 270, y: 198, type: 'chair' },
		{ id: 'chair-12', x: 295, y: 198, type: 'chair' },
		{ id: 'chair-13', x: 318, y: 198, type: 'chair' },
		{ id: 'chair-14', x: 249, y: 158, type: 'chair' },
		{ id: 'chair-15', x: 270, y: 159, type: 'chair' },
		{ id: 'chair-16', x: 226, y: 243, type: 'chair' },
		{ id: 'chair-17', x: 249, y: 245, type: 'chair' },
		{ id: 'chair-18', x: 270, y: 245, type: 'chair' },
		{ id: 'chair-19', x: 293, y: 244, type: 'chair' },
		{ id: 'chair-20', x: 318, y: 245, type: 'chair' },
		{ id: 'chair-21', x: 223, y: 282, type: 'chair' },
		{ id: 'chair-22', x: 248, y: 282, type: 'chair' },
		{ id: 'chair-23', x: 270, y: 282, type: 'chair' },
		{ id: 'chair-24', x: 292, y: 283, type: 'chair' },
		{ id: 'chair-25', x: 317, y: 283, type: 'chair' },
		{ id: 'chair-26', x: 223, y: 328, type: 'chair' },
		{ id: 'chair-27', x: 250, y: 328, type: 'chair' },
		{ id: 'chair-28', x: 273, y: 328, type: 'chair' },
		{ id: 'chair-29', x: 295, y: 328, type: 'chair' },
		{ id: 'chair-30', x: 316, y: 328, type: 'chair' },
		{ id: 'chair-31', x: 223, y: 366, type: 'chair' },
		{ id: 'chair-32', x: 249, y: 366, type: 'chair' },
		{ id: 'chair-33', x: 271, y: 367, type: 'chair' },
		{ id: 'chair-34', x: 295, y: 366, type: 'chair' },
		{ id: 'chair-35', x: 317, y: 368, type: 'chair' },
		{ id: 'chair-36', x: 226, y: 414, type: 'chair' },
		{ id: 'chair-37', x: 249, y: 416, type: 'chair' },
		{ id: 'chair-38', x: 271, y: 414, type: 'chair' },
		{ id: 'chair-39', x: 295, y: 414, type: 'chair' },
		{ id: 'chair-40', x: 319, y: 412, type: 'chair' },
	]);

	function getSeatPos(id: string) {
		return seatPositions.find(s => s.id === id);
	}

	function handleSeatClick(e: MouseEvent) {
		if (editMode) return;
		const target = e.target as SVGElement;
		const id = target.id;
		if (id && (id.startsWith('chair-') || id.startsWith('bench-'))) {
			const type = id.startsWith('chair-') ? 'chair' : 'bench';
			selectedSeat = { id, type };
			onSelect({ id, type });
		}
	}

	function handleSeatHover(e: MouseEvent) {
		const target = e.target as SVGElement;
		hoveredId = target.id || null;
	}

	function handleLeave() {
		hoveredId = null;
	}

	function handleDragStart(e: MouseEvent, seatId: string) {
		if (!editMode) return;
		draggingId = seatId;
		const seat = getSeatPos(seatId);
		if (seat) {
			const svg = (e.target as SVGElement).closest('svg');
			if (svg) {
				const pt = svg.createSVGPoint();
				pt.x = e.clientX;
				pt.y = e.clientY;
				const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
				dragOffset = { x: svgP.x - seat.x, y: svgP.y - seat.y };
			}
		}
	}

	function handleDrag(e: MouseEvent) {
		if (!draggingId) return;
		const seat = getSeatPos(draggingId);
		if (!seat) return;
		
		const svg = (e.target as SVGElement).closest('svg');
		if (svg) {
			const pt = svg.createSVGPoint();
			pt.x = e.clientX;
			pt.y = e.clientY;
			const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
			seat.x = Math.round(svgP.x - dragOffset.x);
			seat.y = Math.round(svgP.y - dragOffset.y);
		}
	}

	function handleDragEnd() {
		if (draggingId) {
			const seat = getSeatPos(draggingId);
			if (seat) {
				console.log(`${seat.id}: x=${seat.x}, y=${seat.y}, width=${seat.type === 'chair' ? 22 : 78}, height=10`);
			}
		}
		draggingId = null;
	}

	function exportPositions() {
		const output = seatPositions.map(s => 
			`{ id: '${s.id}', x: ${s.x}, y: ${s.y}, type: '${s.type}' }`
		).join(',\n');
		console.log('[\n' + output + '\n]');
		alert('Positions logged to console!');
	}
</script>

<svelte:window onmousemove={handleDrag} onmouseup={handleDragEnd} />

<div class="seat-map-container">
	<div class="controls">
		<button class="edit-btn" class:active={editMode} onclick={() => editMode = !editMode}>
			{editMode ? 'Done Editing' : 'Edit Positions'}
		</button>
		{#if editMode}
			<button class="export-btn" onclick={exportPositions}>Export to Console</button>
		{/if}
	</div>
	
	<div class="map-wrapper">
		<svg
			{width}
			{height}
			viewBox="0 0 550 520"
			onclick={handleSeatClick}
			onmouseover={handleSeatHover}
			onmouseout={handleLeave}
		>
			<rect width="550" height="520" fill="#f5f5f5"/>
			<image href="/seating-map.png" x="0" y="0" width="550" height="520" preserveAspectRatio="xMidYMid meet"/>
			<rect x="23.5" y="23.5" width="503" height="474" stroke="black" fill="none"/>
			
			<g class="seats">
				{#each seatPositions as seat (seat.id)}
					<rect
						id={seat.id}
						class="seat {seat.type}"
						class:selected={selectedSeat?.id === seat.id}
						class:hovered={hoveredId === seat.id}
						class:dragging={draggingId === seat.id}
						class:edit-mode={editMode}
						x={seat.x}
						y={seat.y}
						width={seat.type === 'chair' ? 22 : 78}
						height="10"
						onmousedown={(e) => handleDragStart(e, seat.id)}
					/>
				{/each}
			</g>
		</svg>
	</div>
	
	<p class="hint">
		{#if editMode}
			Drag seats to align with the floor plan. Click "Export to Console" when done.
		{:else if hoveredId}
			{hoveredId} - click to select
		{:else}
			40 chairs, 20 benches - hover and click to select
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

	.controls {
		display: flex;
		gap: 8px;
	}

	.edit-btn, .export-btn {
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		border: 2px solid #666;
		background: white;
	}

	.edit-btn.active {
		background: #4caf50;
		color: white;
		border-color: #4caf50;
	}

	.export-btn {
		background: #2196f3;
		color: white;
		border-color: #2196f3;
	}

	.map-wrapper {
		width: 100%;
		max-width: 550px;
		border: 2px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
		cursor: pointer;
	}

	.seat {
		fill: #d9d9d9;
		stroke: #999;
		stroke-width: 0.5;
		transition: fill 0.15s, stroke 0.15s;
	}

	.seat.edit-mode {
		cursor: move;
		stroke: #ff9800;
		stroke-width: 1;
	}

	.seat.dragging {
		opacity: 0.7;
		stroke: #ff5722;
		stroke-width: 2;
	}

	.seat.hovered {
		fill: #ffcc80;
		stroke: #ff9800;
		stroke-width: 1.5;
		cursor: pointer;
	}

	.seat.selected {
		fill: #81c784;
		stroke: #4caf50;
		stroke-width: 2;
	}

	.seat.chair.selected {
		fill: #64b5f6;
		stroke: #2196f3;
	}

	.seat.bench.selected {
		fill: #81c784;
		stroke: #4caf50;
	}

	.hint {
		color: #666;
		font-size: 14px;
		text-align: center;
	}
</style>