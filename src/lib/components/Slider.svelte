<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let {
		value = $bindable(0.5),
		disabled = false,
		showTarget = false,
		targetValue = 0.5
	}: {
		value?: number;
		disabled?: boolean;
		showTarget?: boolean;
		targetValue?: number;
	} = $props();

	let isDragging = $state(false);
	let sliderRef = $state<HTMLDivElement | null>(null);

	function updateValue(clientX: number) {
		if (!sliderRef || disabled) return;

		const rect = sliderRef.getBoundingClientRect();
		const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
		value = x / rect.width;
	}

	let pointerId = $state<number | null>(null);

	function handlePointerDown(event: PointerEvent) {
		if (disabled) return;
		isDragging = true;
		pointerId = event.pointerId;
		updateValue(event.clientX);
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		event.preventDefault();
	}

	function handlePointerMove(event: PointerEvent) {
		if (!isDragging || pointerId !== event.pointerId) return;
		updateValue(event.clientX);
		event.preventDefault();
	}

	function handlePointerUp(event: PointerEvent) {
		if (pointerId !== event.pointerId) return;
		isDragging = false;
		pointerId = null;
		if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
			(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		}
		event.preventDefault();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled) return;

		switch (event.key) {
			case 'ArrowLeft':
				value = Math.max(0, value - 0.05);
				event.preventDefault();
				break;
			case 'ArrowRight':
				value = Math.min(1, value + 0.05);
				event.preventDefault();
				break;
		}
	}

	const handlePosition = $derived(`${value * 100}%`);
	const targetPosition = $derived(`${targetValue * 100}%`);

	// Calculate gradient zones centered around target (only shown when target is visible)
	const gradientStops = $derived.by(() => {
		if (!showTarget) return [];

		const target = targetValue;
		// Scoring thresholds: 4pts (2.5%), 3pts (7.5%), 2pts (15%), 1pt (25%)
		const zones = [
			{ distance: 0.025, color: '#ef4444' },  // 4 points - red
			{ distance: 0.075, color: '#f97316' },  // 3 points - orange
			{ distance: 0.15, color: '#fbbf24' },   // 2 points - yellow
			{ distance: 0.25, color: '#60a5fa' }    // 1 point - blue
		];

		const stops: string[] = [];

		// Add left gradient (from 0% to target)
		const leftZones = zones.map(z => ({
			position: Math.max(0, target - z.distance),
			color: z.color
		})).reverse();

		// Add right gradient (from target to 100%)
		const rightZones = zones.map(z => ({
			position: Math.min(1, target + z.distance),
			color: z.color
		}));

		// Build gradient: gray outside → zones → center (red) → zones → gray outside
		stops.push('#6b7280 0%'); // Gray at start

		// Left side zones
		if (leftZones[0].position > 0) {
			stops.push(`#6b7280 ${leftZones[0].position * 100}%`);
		}
		leftZones.forEach((zone, i) => {
			stops.push(`${zone.color} ${zone.position * 100}%`);
		});

		// Center (4 points)
		stops.push(`#ef4444 ${target * 100}%`);

		// Right side zones
		rightZones.forEach((zone, i) => {
			stops.push(`${zone.color} ${zone.position * 100}%`);
		});
		if (rightZones[rightZones.length - 1].position < 1) {
			stops.push(`#6b7280 ${rightZones[rightZones.length - 1].position * 100}%`);
		}

		stops.push('#6b7280 100%'); // Gray at end

		return stops;
	});
</script>

<div
	bind:this={sliderRef}
	class="relative h-16 w-full touch-none select-none"
	class:cursor-pointer={!disabled}
	class:cursor-not-allowed={disabled}
	role="slider"
	tabindex={disabled ? -1 : 0}
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow={Math.round(value * 100)}
	aria-disabled={disabled}
	onkeydown={handleKeyDown}
	onpointerdown={disabled ? undefined : handlePointerDown}
	onpointermove={disabled ? undefined : handlePointerMove}
	onpointerup={disabled ? undefined : handlePointerUp}
	onpointercancel={disabled ? undefined : handlePointerUp}
>
	<!-- Track -->
	<div
		class="absolute top-1/2 h-4 w-full -translate-y-1/2 rounded-full pointer-events-none transition-all duration-500"
		class:bg-gray-200={!showTarget}
		style={showTarget && gradientStops.length > 0
			? `background: linear-gradient(to right, ${gradientStops.join(', ')})`
			: ''}
	></div>

	<!-- Target indicator -->
	{#if showTarget}
		<div
			transition:slide={{ duration: 500, easing: cubicOut, axis: 'x' }}
			class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
			style="left: {targetPosition}"
		>
			<!-- Target marker -->
			<div class="relative flex flex-col items-center">
				<!-- Triangle pointer -->
				<div class="h-0 w-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-gray-800"></div>
				<!-- Line -->
				<div class="h-10 w-0.5 bg-gray-800"></div>
			</div>
		</div>
	{/if}

	<!-- Handle -->
	<div
		class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
		style="left: {handlePosition}"
	>
		<div class="relative flex flex-col items-center">
			<!-- Line above handle -->
			<div
				class="h-8 w-1 bg-white shadow-md transition-transform"
				class:scale-110={isDragging}
				class:opacity-50={disabled}
			></div>
			<!-- Circular handle -->
			<div
				class="h-12 w-12 rounded-full bg-white shadow-lg transition-transform"
				class:scale-110={isDragging}
				class:opacity-50={disabled}
			>
				<!-- Center line through handle -->
				<div class="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gray-400"></div>
			</div>
			<!-- Line below handle -->
			<div
				class="h-8 w-1 bg-white shadow-md transition-transform"
				class:scale-110={isDragging}
				class:opacity-50={disabled}
			></div>
		</div>
		<span class="sr-only">Slider handle</span>
	</div>
</div>
