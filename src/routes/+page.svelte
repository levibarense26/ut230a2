<script lang="ts">
	import { onMount } from 'svelte';
	import { quizStore } from '$lib/stores/quiz';
	import { determineArchetype, ARCHETYPE_DESCRIPTIONS, DWELLING_OPTIONS, GROUP_OPTIONS, PRIORITY_OPTIONS, IMMERSION_OPTIONS, MEAL_OPTIONS } from '$lib/archetypes';
	import SeatMapSVG from '$lib/components/SeatMapSVG.svelte';
	import Heatmap from '$lib/components/Heatmap.svelte';
	import type { QuizState } from '$lib/stores/quiz';
    import SeatMap from '$lib/components/SeatMap.svelte';

	let quizState: QuizState = $state({
		currentFrame: 1,
		mealTime: null,
		groupSize: null,
		priority: null,
		immersion: null,
		map1Seat: null,
		map2Seat: null,
		map3Seat: null,
		dwelling1: null,
		dwelling2: null,
		archetype: null,
		submitted: false
	});

	onMount(() => {
		const unsubscribe = quizStore.subscribe(s => {
			quizState = { ...s };
		});

		function onMouseMove(e: MouseEvent) {
			if (isDragging) handleSliderMove(e);
		}

		function onMouseUp() {
			if (isDragging) handleSliderEnd();
		}

		function onTouchMove(e: TouchEvent) {
			if (isDragging) handleSliderMove(e);
		}

		function onTouchEnd() {
			if (isDragging) handleSliderEnd();
		}

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
		window.addEventListener('touchmove', onTouchMove);
		window.addEventListener('touchend', onTouchEnd);

		return () => {
			unsubscribe();
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onTouchEnd);
		};
	});

	const totalFrames = 17;

	function nextFrame() {
		if (quizState.currentFrame === 13) {
			const archetype = determineArchetype({
				dwelling: quizState.dwelling2 as any,
				groupSize: quizState.groupSize as any,
				priority: quizState.priority as any,
				immersion: quizState.immersion as any
			});
			quizStore.setArchetype(archetype);
			quizStore.nextFrame();
			submitQuiz();
		} else if (quizState.currentFrame < totalFrames) {
			quizStore.nextFrame();
		}
	}

	function prevFrame() {
		if (quizState.currentFrame > 1) {
			quizStore.prevFrame();
		}
	}

	function selectMeal(meal: string) {
		quizStore.setMealTime(meal);
		nextFrame();
	}

	function selectGroup(size: string) {
		quizStore.setGroupSize(size);
		nextFrame();
	}

	function selectPriority(priority: string) {
		quizStore.setPriority(priority);
		nextFrame();
	}

	function selectImmersion(immersion: string) {
		quizStore.setImmersion(immersion);
		nextFrame();
	}

	function handleMap1Select(seat: { id: string; type: string }) {
		quizStore.setMap1Seat(seat as any);
	}

	function handleMap2Select(seat: { id: string; type: string }) {
		quizStore.setMap2Seat(seat as any);
	}

	function handleMap3Select(seat: { id: string; type: string }) {
		quizStore.setMap3Seat(seat as any);
	}

	function selectDwelling1(value: string) {
		quizStore.setDwelling1(value);
		nextFrame();
	}

	function selectDwelling2(value: string) {
		quizStore.setDwelling2(value);
		nextFrame();
	}

	async function submitQuiz() {
		const data = {
			meal_time: quizState.mealTime || '',
			group_size: quizState.groupSize || '',
			priority: quizState.priority || '',
			immersion: quizState.immersion || '',
			map1_seat: quizState.map1Seat || { id: '', type: '' },
			map2_seat: quizState.map2Seat || { id: '', type: '' },
			map3_seat: quizState.map3Seat || { id: '', type: '' },
			dwelling1: quizState.dwelling1 || '',
			dwelling2: quizState.dwelling2 || '',
			archetype: quizState.archetype || ''
		};

		try {
			await fetch('/api/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			quizStore.setSubmitted(true);
		} catch (err) {
			console.error('Failed to submit:', err);
		}
	}

	function restartQuiz() {
		quizStore.reset();
	}

	let aggregateData: { x: number; y: number }[] = $state([]);
	let selectedMealFilter = $state('All');
	let loading = $state(true);

	async function loadAggregateData() {
		try {
			const url = selectedMealFilter === 'All' 
				? '/api/aggregate' 
				: `/api/aggregate?meal_time=${selectedMealFilter}`;
			const res = await fetch(url);
			const data = await res.json();
			aggregateData = data.submissions?.flatMap((s: any) => [s.map1_seat, s.map2_seat, s.map3_seat]) || [];
			loading = false;
		} catch (err) {
			console.error('Failed to load aggregate data:', err);
			loading = false;
		}
	}

	$effect(() => {
		if (quizState.currentFrame === 17) {
			loadAggregateData();
		}
	});

	function getProgress(): number {
		return ((quizState.currentFrame - 1) / totalFrames) * 100;
	}

	let sliderValue = $state(0);
	let isDragging = $state(false);
	let sliderTrack: HTMLDivElement | undefined = $state();

	function handleSliderStart(e: MouseEvent | TouchEvent) {
		isDragging = true;
		handleSliderMove(e);
	}

	function handleSliderMove(e: MouseEvent | TouchEvent) {
		if (!isDragging || !sliderTrack) return;
		
		const rect = sliderTrack.getBoundingClientRect();
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		let percent = (clientX - rect.left) / rect.width;
		percent = Math.max(0, Math.min(1, percent));
		sliderValue = percent;
	}

	function handleSliderEnd() {
		if (sliderValue > 0.7) {
			nextFrame();
		}
		isDragging = false;
		sliderValue = 0;
	}

	function getPictureSrc(frameNum: number, picNum: number): string {
		return `/frame-${frameNum}.jpg`;
	}
</script>

<svelte:head>
	<title>Dining Hall Archetype Quiz</title>
</svelte:head>

<main>
	<div class="progress-bar" style="width: {getProgress()}%"></div>
	<div class="container">
		{#if quizState.currentFrame === 1}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-top">
						<h1 style="text-align: center;">Discover Your Dining Hall Archetype</h1>
						<!-- <p class="subtitle">Discover your dining hall archetype</p> -->
						<div 
							class="swipe-slider"
							bind:this={sliderTrack}
							onmousedown={handleSliderStart}
							ontouchstart={handleSliderStart}
						>
							<div class="slider-track">
								<div class="slider-fill" style="width: {sliderValue * 100}%"></div>
								<div class="slider-thumb" style="left: {sliderValue * 100}%">
									<svg viewBox="0 0 80 50" width="80" height="50" xmlns="http://www.w3.org/2000/svg">
										<foreignObject width="100%" height="100%">
											<img src="/swipe-icon.jpg" alt="swipe" xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;pointer-events:none;" />
										</foreignObject>
									</svg>
								</div>
							</div>
							<span class="slider-hint">Swipe to continue</span>
						</div>
					</div>
					<div class="quiz-right">
						<!-- <h2>Two main reasons: comfort and rejuvenation.</h2>
						<p1> Students need a break from their busy schedules. The dining hall, in contrast to other university spaces, is designed as a space for relaxation. Students go there to relieve stress and recover a bit of energy from their days. </p1> -->
						<div class="picture-container picture-layout-single">
							<div class="picture-frame"><img src="/intro.HEIC" alt="1"></div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if quizState.currentFrame === 2}
			<div class="frame">
				<div class="frame-card2">
					<div class="quiz-center">
						<h1>Why do people go to the dining hall?</h1>
						<p class="subtitle">
							Two main reasons: 
							<span style="color: #82D5E1; font-weight:bold"> comfort </span>
							and 
							<span style="color: #82D5E1; font-weight:bold"> rejuvenation </span>.</p>
						<p class="context" style="text-align: left;">Students need a break from their busy schedules. The dining hall, in contrast to other university spaces, is designed as a space for relaxation. Students go there to relieve stress and recover a bit of energy from their days. </p>
						<p class="context" style="text-align: left;">Mo-Jo Dining Hall is a hub for students. It sits on Central Campus, not far from the Diag. From burgers to rice dishes to a salad bar, students can enjoy a variety of meal options and cuisines. This dining hall is one of the largest and most diverse on campus, which attracts many students. It is almost always busy, so plan on not getting the perfect seat!</p>
						<div class="nav-actions">
							<button class="btn-secondary" onclick={prevFrame}>Back</button>
							<button class="btn-primary" onclick={nextFrame}>Next</button>
						</div>
					<!-- </div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-4">
							<div class="picture-frame"><img src={getPictureSrc(2, 1)} alt="1"></div>
							<div class="picture-frame"><img src={getPictureSrc(2, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(2, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(2, 4)} alt="4"></div>
						</div> -->
					</div>
				</div>
			</div>
		{/if}

		{#if quizState.currentFrame === 3}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<!-- <p class="context">placeholder</p> -->
						<h2>What meal are you eating?</h2>
						<p class="context">People want different things at different times of the day. Use patterns in the dining halls vary throughout the day as people move throughout their days.</p>
						<div class="options">
							{#each MEAL_OPTIONS as meal}
								<button 
									class="btn-option" 
									class:selected={quizState.mealTime === meal}
									onclick={() => selectMeal(meal)}
								>
									{meal}
								</button>
							{/each}
						</div>
						<button class="btn-back" onclick={prevFrame}>Back</button>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-single">
							<div class="picture-frame"><img src="/food_area.jpg" alt="1"></div>
							<!-- <div class="picture-frame"><img src={getPictureSrc(3, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(3, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(3, 4)} alt="4"></div> -->
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if quizState.currentFrame === 4}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<!-- <p class="context">placeholder</p> -->
						<h2>Who are you eating with?</h2>
						<div class="options">
							{#each GROUP_OPTIONS as group}
								<button 
									class="btn-option" 
									class:selected={quizState.groupSize === group}
									onclick={() => selectGroup(group)}
								>
									{group}
								</button>
							{/each}
						</div>
						<button class="btn-back" onclick={prevFrame}>Back</button>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-single">
							<div class="picture-frame"><img src="/conversation.jpg" alt="1"></div>
							<!-- <div class="picture-frame"><img src={getPictureSrc(4, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(4, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(4, 4)} alt="4"></div> -->
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if quizState.currentFrame === 5}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<!-- <p class="context">placeholder</p> -->
						<h2>Where do you go in the dining hall first?</h2>
						<p class="context">First impressions are important. Where people choose to go first in the dining hall helps indicate their reason for being there and what they value most.</p>
						<div class="options">
							{#each PRIORITY_OPTIONS as priority}
								<button 
									class="btn-option" 
									class:selected={quizState.priority === priority}
									onclick={() => selectPriority(priority)}
								>
									{priority}
								</button>
							{/each}
						</div>
						<button class="btn-back" onclick={prevFrame}>Back</button>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-single">
							<div class="picture-frame"><img src="/choice2.HEIC" alt="1"></div>
							<!-- <div class="picture-frame"><img src={getPictureSrc(5, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(5, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(5, 4)} alt="4"></div> -->
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if quizState.currentFrame === 6}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<!-- <p class="context">placeholder</p> -->
						<h2>What are you going to do while you eat?</h2>
						<p class="context">What do you want from your dining hall experience? The way you interact with the dining hall will change how your experience plays out.</p>
						<div class="options">
							{#each IMMERSION_OPTIONS as immersion}
								<button 
									class="btn-option" 
									class:selected={quizState.immersion === immersion}
									onclick={() => selectImmersion(immersion)}
								>
									{immersion}
								</button>
							{/each}
						</div>
						<button class="btn-back" onclick={prevFrame}>Back</button>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-single">
							<div class="picture-frame"><img src="/eating.jpg" alt="1"></div>
							<!-- <div class="picture-frame"><img src={getPictureSrc(6, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(6, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(6, 4)} alt="4"></div> -->
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- {#if quizState.currentFrame === 7}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<h2>General view of the section</h2>
						<p class="placeholder">Section overview content here</p>
						<div class="nav-actions">
							<button class="btn-secondary" onclick={prevFrame}>Back</button>
							<button class="btn-primary" onclick={nextFrame}>Next</button>
						</div>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-4">
							<div class="picture-frame"><img src={getPictureSrc(7, 1)} alt="1"></div>
							<div class="picture-frame"><img src={getPictureSrc(7, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(7, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(7, 4)} alt="4"></div>
						</div>
					</div>
				</div>
			</div>
		{/if} -->

		{#if quizState.currentFrame === 7}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<h2>Select your preferred seat</h2>
						<p class="context">Low occupancy</p>
						<SeatMapSVG 
							width={400}
							height={380}
							selectedSeat={quizState.map1Seat}
							occupancy="low"
							onSelect={handleMap1Select}
						/>
						<div class="map-actions">
							<button class="btn-secondary" onclick={prevFrame}>Back</button>
							<button 
								class="btn-primary"
								disabled={!quizState.map1Seat}
								onclick={nextFrame}
							>
								Next
							</button>
						</div>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-single">
							<div class="picture-frame"><img src="/overview.jpg" alt="1"></div>
							<!-- <div class="picture-frame"><img src="/solitude.jpg" alt="2"></div> -->
						</div>
					</div>
				</div>
			</div>
		{/if}

{#if quizState.currentFrame === 8}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<h2>Choose your seat:</h2>
						<p class="context">It's busier now! Where do you sit with more constraints?</p>
<SeatMap></SeatMap> 
					width={300}
					height={240}
						<h2>Select the seat you typically take</h2>
						<p class="context">Medium occupancy</p>
<SeatMapSVG 
					width={400}
					height={380}
					selectedSeat={quizState.map2Seat}
					occupancy="medium"
					onSelect={handleMap2Select}
				/>
						<div class="map-actions">
							<button class="btn-secondary" onclick={prevFrame}>Back</button>
							<button 
								class="btn-primary" 
								disabled={!quizState.map2Seat}
								onclick={nextFrame}
							>
								Next
							</button>
						</div>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-single">
							<div class="picture-frame"><img src="/overview.jpg" alt="1"></div>
							<!-- <div class="picture-frame"><img src={getPictureSrc(9, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(9, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(9, 4)} alt="4"></div> -->
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if quizState.currentFrame === 9}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<h2>Choose your seat:</h2>
						<p class="context">This section is nearly full. Where do you sit now?</p>
						<SeatMap 
							width={200}
							height={160}
						<h2>Select the seat you typically take</h2>
						<p class="context">High occupancy</p>
						<SeatMapSVG 
							width={400}
							height={380}
							selectedSeat={quizState.map3Seat}
							occupancy="high"
							onSelect={handleMap3Select}
						/>
						<div class="map-actions">
							<button class="btn-secondary" onclick={prevFrame}>Back</button>
							<button 
								class="btn-primary" 
								disabled={!quizState.map3Seat}
								onclick={nextFrame}
							>
								Next
							</button>
						</div>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-4">
							<div class="picture-frame"><img src={getPictureSrc(10, 1)} alt="1"></div>
							<div class="picture-frame"><img src={getPictureSrc(10, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(10, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(10, 4)} alt="4"></div>
						</div>
					</div>
				</div>
			</div>
		{/if}

{#if quizState.currentFrame === 11}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<h2>How long will you spend in your seat?</h2>
						<p class="context">How comfortable do you feel with this spot?</p>
						<div class="options">
							{#each DWELLING_OPTIONS as dwelling}
								<button 
									class="btn-option" 
									class:selected={quizState.dwelling1 === dwelling}
									onclick={() => selectDwelling1(dwelling)}
								>
									{dwelling}
								</button>
							{/each}
						</div>
						<button class="btn-back" onclick={prevFrame}>Back</button>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-single">
							<div class="picture-frame"><img src={getPictureSrc(11, 1)} alt="1"></div>
							<!-- <div class="picture-frame"><img src={getPictureSrc(11, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(11, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(11, 4)} alt="4"></div> -->
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- {#if quizState.currentFrame === 11}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<h2>One more question</h2>
						<div class="nav-actions">
							<button class="btn-secondary" onclick={prevFrame}>Back</button>
							<button class="btn-primary" onclick={nextFrame}>Next</button>
						</div>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-single">
							<div class="picture-frame"><img src={getPictureSrc(12, 1)} alt="1"></div>
						</div>
					</div>
				</div>
			</div>
		{/if} -->

		{#if quizState.currentFrame === 11}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<h3>Reveal Archetype</h3>
						<button class="btn-primary btn-large" onclick={nextFrame}>
							Reveal Your Archetype
						</button>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-4">
							<div class="picture-frame"><img src={getPictureSrc(13, 1)} alt="1"></div>
							<div class="picture-frame"><img src={getPictureSrc(13, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(13, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(13, 4)} alt="4"></div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if quizState.currentFrame === 12}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<h2>You're a...</h2>
						<div class="archetype-name">{quizState.archetype}</div>
						<div class="archetype-description">
							{ARCHETYPE_DESCRIPTIONS[quizState.archetype || ''] || 'placeholder description'}
						</div>
						<button class="btn-primary" onclick={nextFrame}>Next</button>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-4">
							<div class="picture-frame"><img src={getPictureSrc(14, 1)} alt="1"></div>
							<div class="picture-frame"><img src={getPictureSrc(14, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(14, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(14, 4)} alt="4"></div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if quizState.currentFrame === 13}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<h2>What does this mean?</h2>
						<p class="placeholder">placeholder description</p>
						<div class="nav-actions">
							<button class="btn-secondary" onclick={prevFrame}>Back</button>
							<button class="btn-primary" onclick={nextFrame}>Next</button>
						</div>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-4">
							<div class="picture-frame"><img src={getPictureSrc(15, 1)} alt="1"></div>
							<div class="picture-frame"><img src={getPictureSrc(15, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(15, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(15, 4)} alt="4"></div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if quizState.currentFrame === 14}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<h2>How did we get here?</h2>
						<p class="placeholder">placeholder description</p>
						<div class="nav-actions">
							<button class="btn-secondary" onclick={prevFrame}>Back</button>
							<button class="btn-primary" onclick={nextFrame}>Next</button>
						</div>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-4">
							<div class="picture-frame"><img src={getPictureSrc(16, 1)} alt="1"></div>
							<div class="picture-frame"><img src={getPictureSrc(16, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(16, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(16, 4)} alt="4"></div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if quizState.currentFrame === 15}
			<div class="frame">
				<div class="frame-card">
					<div class="quiz-left">
						<h2>What did we find?</h2>
						
						<div class="filter-section">
							<label for="meal-filter">Filter by meal time:</label>
							<select id="meal-filter" bind:value={selectedMealFilter} onchange={loadAggregateData}>
								<option value="All">All Meals</option>
								{#each MEAL_OPTIONS as meal}
									<option value={meal}>{meal}</option>
								{/each}
							</select>
						</div>

						{#if loading}
							<p>Loading aggregate data...</p>
						{:else}
							<div class="heatmap-container">
								<Heatmap seats={aggregateData} width={400} height={380} previewMode={aggregateData.length === 0} />
							</div>
							<p class="stats">
								Showing {aggregateData.length} seat selections from {Math.ceil(aggregateData.length / 3)} submissions
							</p>
						{/if}

						<div class="results-actions">
							<button class="btn-secondary" onclick={prevFrame}>Back</button>
							<button class="btn-primary" onclick={restartQuiz}>Take Quiz Again</button>
						</div>
					</div>
					<div class="quiz-right">
						<div class="picture-container picture-layout-4">
							<div class="picture-frame"><img src={getPictureSrc(17, 1)} alt="1"></div>
							<div class="picture-frame"><img src={getPictureSrc(17, 2)} alt="2"></div>
							<div class="picture-frame"><img src={getPictureSrc(17, 3)} alt="3"></div>
							<div class="picture-frame"><img src={getPictureSrc(17, 4)} alt="4"></div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		/* font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; */
		font-family: Helvetica;
		background: #fafafa;
		color: #333;
	}

	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.progress-bar {
		height: 4px;
		background: #82D5E1;
		transition: width 0.3s ease;
	}

	.container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}

	.frame {
		width: 100%;
		max-width: 100%;
		padding: 0;
		height: 100vh;
	}

.frame-card {
		background: white;
		border-radius: 12px;
		padding: 24px;
		display: flex;
		flex-direction: row;
		gap: 16px;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 100%;
		height: 100vh;
		box-sizing: border-box;
	}

	.quiz-left {
		background: #e0e0e0;
		border-radius: 8px;
		flex: 0 0 30%;
		height: 100%;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 16px;
		overflow: auto;
		min-height: 100vh;
		width: 100%;
	}

	.quiz-left {
		width: 100%;
		background: #e0e0e0;
		border-radius: 8px;
		min-height: 250px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
	}

	.quiz-right {
		flex: 0 0 50%;
		background: #e0e0e0;
		border-radius: 8px;
		height: 100%;
		max-height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		overflow: hidden;
	}

.frame-card2 {
		background: white;
		border-radius: 12px;
		padding: 50px;
		display: block;
		flex-direction: column;
		gap: 16px;
		align-items: column;
		justify-content: center;
		width: 100%;
		max-width: 100%;
		height: 80vh;
		box-sizing: border-box;
	}

	.quiz-center {
		flex: 0 0 50%;
		background: #e0e0e0;
		border-radius: 8px;
		height: 70%;
		max-height: 80vh;
		display: block;
		align-items: center;
		justify-content: center;
		padding: 16px;
		overflow: hidden;
	}

	.quiz-center2 {
		flex: 0 0 50%;
		background: #e0e0e0;
		border-radius: 8px;
		height: 90%;
		max-height: 80vh;
		display: block;
		align-items: center;
		justify-content: center;
		padding: 16px;
		overflow: hidden;
	}

	.picture-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
		align-content: center;
	}

	.picture-frame {
		background: #ffffff;
		border-radius: 4px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.picture-frame img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.picture-layout-single .picture-frame {
		width: 100%;
		height: 100%;
	}

	.picture-layout-2-h {
		flex-direction: row;
	}
	.picture-layout-2-h .picture-frame {
		width: calc(50% - 4px);
		height: 100%;
	}

	.picture-layout-2-v {
		flex-direction: column;
	}
	.picture-layout-2-v .picture-frame {
		width: 100%;
		height: calc(50% - 4px);
	}

	.picture-layout-3 {
		flex-direction: column;
	}
	.picture-layout-3 .picture-frame:first-child {
		width: 100%;
		height: calc(50% - 4px);
	}
	.picture-layout-3 .picture-row {
		width: 100%;
		height: calc(50% - 4px);
		display: flex;
		gap: 8px;
	}
	.picture-layout-3 .picture-row .picture-frame {
		flex: 1;
		height: 100%;
	}

	.picture-layout-4 {
		flex-wrap: wrap;
	}
	.picture-layout-4 .picture-frame {
		width: calc(50% - 4px);
		height: calc(50% - 4px);
	}

	.frame-title h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		font-size: 1.5rem;
		color: #000000;
		margin-bottom: 2rem;
	}

	.context {
		color: #000000;
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}
	
	h2 {
		font-size: 1.8rem;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 1.5rem;
	}

	.btn-primary, .btn-secondary, .btn-option {
		padding: 14px 28px;
		font-size: 1rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-primary {
		background: #82D5E1;
		color: white;
		border: none;
	}

	.btn-primary:hover {
		background: #82D5E1;
	}

	.btn-primary:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: white;
		color: #666;
		border: 1px solid #ddd;
	}

	.btn-secondary:hover {
		background: #f5f5f5;
	}

	.btn-option {
		background: white;
		border: 2px solid #ddd;
		color: #333;
	}

	.btn-option:hover {
		border-color: #82D5E1;
	}

	.btn-option.selected {
		background: #B4E5EC;
		border-color: #82D5E1;
		color: #333333;
	}

	.btn-back {
		background: #afafaf;
		border: none;
		color: #000000;
		cursor: pointer;
		padding: 8px 16px;
	}

	.btn-back:hover {
		color: #333;
	}

	.frame-map {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.map-actions {
		display: flex;
		gap: 12px;
		margin-top: 1rem;
	}

	.frame-popup {
		display: flex;
		justify-content: center;
	}

	.popup {
		background: white;
		padding: 2rem;
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		text-align: center;
		min-width: 300px;
	}

	.popup h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
	}

	.popup-context {
		color: #888;
		margin-bottom: 1.5rem;
	}

	.btn-large {
		padding: 18px 36px;
		font-size: 1.1rem;
	}

	.frame-reveal {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.archetype-name {
		font-size: 3rem;
		font-weight: bold;
		color: #82D5E1;
		margin: 1rem 0;
	}

	.archetype-description {
		font-size: 1.1rem;
		color: #666;
		margin-bottom: 2rem;
		max-width: 400px;
	}

	.placeholder {
		color: #888;
		font-style: italic;
		margin-bottom: 2rem;
	}

	.nav-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.frame-results {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.filter-section {
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.filter-section select {
		padding: 8px 16px;
		border-radius: 6px;
		border: 1px solid #ddd;
		font-size: 1rem;
	}

	.heatmap-container {
		margin: 1rem 0;
	}

	.stats {
		color: #888;
		font-size: 0.9rem;
		margin: 1rem 0;
	}

	.results-actions {
		display: flex;
		gap: 12px;
		margin-top: 1rem;
	}

	.swipe-slider {
		width: 300px;
		position: relative;
		cursor: pointer;
		user-select: none;
		touch-action: none;
		margin: 0 auto;
	}

	.slider-track {
		width: 100%;
		height: 60px;
		background: #e0e0e0;
		border-radius: 30px;
		position: relative;
		overflow: visible;
	}

	.slider-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(90deg, #82D5E1, #B4E5EC);
		transition: width 0.05s;
		border-radius: 30px;
	}

	.slider-thumb {
		position: absolute;
		top: 50%;
		left: 0;
		transform: translateY(-50%);
		width: 80px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: left 0.05s;
		z-index: 10;
	}

	.slider-thumb svg {
		width: 80px;
		height: 50px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.3);
		overflow: hidden;
	}

	.slider-hint {
		display: block;
		margin-top: 12px;
		font-size: 14px;
		color: #888;
		text-align: center;
	}
</style>
