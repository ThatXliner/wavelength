<script lang="ts">
	let {
		leftEndpoint = $bindable('Hot'),
		rightEndpoint = $bindable('Cold'),
		onSubmit
	}: {
		leftEndpoint?: string;
		rightEndpoint?: string;
		onSubmit: () => void;
	} = $props();

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		onSubmit();
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<div class="text-center">
		<h2 class="text-xl font-semibold text-gray-800">Configure Slider Endpoints</h2>
		<p class="text-sm text-gray-600">Set the labels for the left and right sides of the slider</p>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="left-endpoint" class="mb-1 block text-sm font-medium text-gray-700">
				Left Endpoint
			</label>
			<input
				id="left-endpoint"
				type="text"
				bind:value={leftEndpoint}
				required
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
				placeholder="e.g., Hot"
			/>
		</div>

		<div>
			<label for="right-endpoint" class="mb-1 block text-sm font-medium text-gray-700">
				Right Endpoint
			</label>
			<input
				id="right-endpoint"
				type="text"
				bind:value={rightEndpoint}
				required
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
				placeholder="e.g., Cold"
			/>
		</div>
	</div>

	<button
		type="submit"
		class="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
	>
		Start Game
	</button>
</form>
