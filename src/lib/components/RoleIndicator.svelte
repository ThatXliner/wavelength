<script lang="ts">
	let { roundNumber, role }: { roundNumber: number; role: string } = $props();
</script>

<div class="flex items-center justify-center gap-4">
	<div class="rounded-full bg-gray-200 px-4 py-1 text-sm font-medium text-gray-700">
		Round {roundNumber}
	</div>
	<div class="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
		{role}
	</div>
</div>
