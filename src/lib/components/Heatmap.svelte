<script lang="ts">
	import { onMount } from 'svelte';

	let { seats = [], width = 400, height = 380, previewMode = false }: {
		seats: ({ id: string; type: string } | { x: number; y: number })[];
		width?: number;
		height?: number;
		previewMode?: boolean;
	} = $props();

	interface SeatCount {
		id: string;
		type: 'chair' | 'bench';
		x: number;
		y: number;
		count: number;
	}

	const seatPositions: Omit<SeatCount, 'count'>[] = [
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
	];

	const archetypeColors: Record<string, string> = {
		'Rusher': '#E91E63',
		'Unicorn': '#9C27B0',
		'iPad Kid': '#3F51B5',
		'Group Hangout': '#00BCD4',
		'My Way': '#4CAF50',
		
	};

	const defaultArchetypes = ['Rusher', 'Unicorn', 'iPad Kid', 'Group Hangout', 'My Way'];

	let archetypeData = $state<Map<string, SeatCount[]>>(new Map());
	let maxCount = $state(1);

	function getArchetypeColor(archetype: string): string {
		return archetypeColors[archetype] || '#666666';
	}

	function processSeats() {
		const newData = new Map<string, SeatCount[]>();
		defaultArchetypes.forEach(a => newData.set(a, []));

		if (!previewMode && seats.length > 0) {
			const counts = new Map<string, number>();
			
			for (const seat of seats) {
				let id: string;
				if ('id' in seat && seat.id) {
					id = seat.id;
				} else if ('type' in seat && seat.type) {
					id = seat.type;
				} else {
					const legacySeat = seat as { x: number; y: number };
					const pos = seatPositions.find(s => 
						Math.abs(s.x - legacySeat.x * 550) < 20 && 
						Math.abs(s.y - legacySeat.y * 520) < 20
					);
					id = pos?.id || `seat-${legacySeat.x}-${legacySeat.y}`;
				}
				counts.set(id, (counts.get(id) || 0) + 1);
			}

			for (const [id, count] of counts) {
				const pos = seatPositions.find(s => s.id === id);
				if (!pos) continue;

				const archetype = defaultArchetypes[count % defaultArchetypes.length];
				const existing = newData.get(archetype) || [];
				existing.push({ ...pos, count });
				newData.set(archetype, existing);
			}
		}

		let max = 1;
		for (const [, seatList] of newData) {
			for (const s of seatList) {
				if (s.count > max) max = s.count;
			}
		}

		archetypeData = newData;
		maxCount = max;
	}

	$effect(() => {
		processSeats();
	});
</script>

<div class="heatmap-container">
	<div class="map-wrapper">
		<svg {width} {height} viewBox="0 0 550 520">
			<rect width="550" height="520" fill="#f5f5f5"/>
			<image href="/seating-map.png" x="0" y="0" width="550" height="520" preserveAspectRatio="xMidYMid meet"/>
			<rect x="23.5" y="23.5" width="503" height="474" stroke="black" fill="none"/>

			{#if previewMode}
				{#each seatPositions as pos, i}
					{@const count = (i % 3) + 1}
					{@const size = 5 + count * 3}
					{@const color = getArchetypeColor(defaultArchetypes[i % defaultArchetypes.length])}
					<circle
						cx={pos.x + (pos.type === 'bench' ? 39 : 11)}
						cy={pos.y + 5}
						r={size}
						fill={color}
						opacity="0.6"
					/>
				{/each}
			{:else}
				{#each [...archetypeData] as [archetype, seatList]}
					{#each seatList as seat}
						{@const size = 5 + Math.floor((seat.count / maxCount) * 15)}
						{@const color = getArchetypeColor(archetype)}
						<circle
							cx={seat.x + (seat.type === 'bench' ? 39 : 11)}
							cy={seat.y + 5}
							r={size}
							fill={color}
							opacity="0.65"
						>
							<title>{archetype}: {seat.count} selections</title>
						</circle>
					{/each}
				{/each}
			{/if}
		</svg>
	</div>

	<div class="legend">
		{#each defaultArchetypes as archetype}
			<div class="legend-item">
				<span class="legend-dot" style="background: {getArchetypeColor(archetype)}"></span>
				<span class="legend-label">{archetype}</span>
			</div>
		{/each}
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
		width: 100%;
		max-width: 400px;
		border: 2px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		justify-content: center;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.legend-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.legend-label {
		font-size: 12px;
		color: #666;
	}
</style>