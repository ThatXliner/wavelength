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
	<div class="absolute top-1/2 h-4 w-full -translate-y-1/2 rounded-full bg-gray-200 pointer-events-none"></div>

	<!-- Target indicator -->
	{#if showTarget}
		<div
			transition:slide={{ duration: 500, easing: cubicOut, axis: 'x' }}
			class="absolute top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500 pointer-events-none"
			style="left: {targetPosition}"
		></div>
	{/if}

	<!-- Handle -->
	<div
		class="absolute top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg transition-transform pointer-events-none"
		class:scale-110={isDragging}
		class:opacity-50={disabled}
		style="left: {handlePosition}"
	>
		<span class="sr-only">Slider handle</span>
	</div>
</div>
