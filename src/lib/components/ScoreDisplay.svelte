<script lang="ts">
	let {
		hostScore,
		guestScore,
		isHost
	}: { hostScore: number; guestScore: number; isHost: boolean } = $props();
</script>

<div class="flex justify-center gap-8">
	<div class="text-center" class:font-bold={isHost}>
		<div class="text-sm text-gray-600">You</div>
		<div class="text-3xl font-bold text-gray-800">{hostScore}</div>
	</div>

	<div class="flex items-center text-2xl text-gray-400">-</div>

	<div class="text-center" class:font-bold={!isHost}>
		<div class="text-sm text-gray-600">Opponent</div>
		<div class="text-3xl font-bold text-gray-800">{guestScore}</div>
	</div>
</div>
