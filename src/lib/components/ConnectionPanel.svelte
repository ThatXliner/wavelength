<script lang="ts">
	import type { ConnectionState } from '$lib/webrtc/types';

	let {
		connectionState,
		offer,
		answer,
		onCreateOffer,
		onAcceptOffer,
		onAcceptAnswer
	}: {
		connectionState: ConnectionState;
		offer: string;
		answer: string;
		onCreateOffer: () => Promise<void>;
		onAcceptOffer: (offer: string) => Promise<void>;
		onAcceptAnswer: (answer: string) => Promise<void>;
	} = $props();

	let mode = $state<'host' | 'join' | null>(null);
	let offerInput = $state('');
	let answerInput = $state('');
	let isLoading = $state(false);
	let error = $state('');

	async function handleCreateOffer() {
		isLoading = true;
		error = '';
		try {
			await onCreateOffer();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create offer';
		}
		isLoading = false;
	}

	async function handleAcceptOffer() {
		if (!offerInput.trim()) {
			error = 'Please paste an offer';
			return;
		}

		isLoading = true;
		error = '';
		try {
			await onAcceptOffer(offerInput);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to accept offer';
		}
		isLoading = false;
	}

	async function handleAcceptAnswer() {
		if (!answerInput.trim()) {
			error = 'Please paste an answer';
			return;
		}

		isLoading = true;
		error = '';
		try {
			await onAcceptAnswer(answerInput);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to accept answer';
		}
		isLoading = false;
	}

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}
</script>

<div class="mx-auto max-w-2xl space-y-6 p-6">
	<div class="text-center">
		<h1 class="text-3xl font-bold text-gray-800">Wavelength</h1>
		<p class="mt-2 text-gray-600">Connect with another player to start</p>
	</div>

	{#if connectionState === 'connecting'}
		<div class="rounded-lg bg-blue-50 p-4 text-center">
			<p class="text-blue-700">Connecting...</p>
		</div>
	{:else if !mode}
		<div class="grid grid-cols-2 gap-4">
			<button
				onclick={() => (mode = 'host')}
				class="rounded-lg border-2 border-gray-300 bg-white px-6 py-8 font-medium text-gray-700 transition-colors hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				<div class="text-xl font-semibold">Host Game</div>
				<div class="mt-2 text-sm text-gray-600">Create a new game</div>
			</button>

			<button
				onclick={() => (mode = 'join')}
				class="rounded-lg border-2 border-gray-300 bg-white px-6 py-8 font-medium text-gray-700 transition-colors hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				<div class="text-xl font-semibold">Join Game</div>
				<div class="mt-2 text-sm text-gray-600">Join an existing game</div>
			</button>
		</div>
	{:else if mode === 'host'}
		<div class="space-y-4">
			<div class="text-center">
				<h2 class="text-xl font-semibold text-gray-800">Host a Game</h2>
				<p class="text-sm text-gray-600">Create an offer and share it with another player</p>
			</div>

			{#if !offer}
				<button
					onclick={handleCreateOffer}
					disabled={isLoading}
					class="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{isLoading ? 'Creating...' : 'Create Offer'}
				</button>
			{:else if !answer}
				<div class="space-y-4">
					<div>
						<label for="offer-display" class="mb-1 block text-sm font-medium text-gray-700">
							Your Offer (Share this)
						</label>
						<div class="relative">
							<textarea
								id="offer-display"
								readonly
								value={offer}
								class="h-32 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-xs"
							></textarea>
							<button
								onclick={() => copyToClipboard(offer)}
								class="absolute right-2 top-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
							>
								Copy
							</button>
						</div>
					</div>

					<div>
						<label for="answer-input" class="mb-1 block text-sm font-medium text-gray-700">
							Paste Answer from Joiner
						</label>
						<textarea
							id="answer-input"
							bind:value={answerInput}
							placeholder="Paste the answer here..."
							class="h-32 w-full rounded-lg border border-gray-300 p-3 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
						></textarea>
					</div>

					<button
						onclick={handleAcceptAnswer}
						disabled={isLoading}
						class="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
					>
						{isLoading ? 'Connecting...' : 'Connect'}
					</button>
				</div>
			{/if}
		</div>
	{:else if mode === 'join'}
		<div class="space-y-4">
			<div class="text-center">
				<h2 class="text-xl font-semibold text-gray-800">Join a Game</h2>
				<p class="text-sm text-gray-600">Paste the offer from the host</p>
			</div>

			{#if !answer}
				<div class="space-y-4">
					<div>
						<label for="offer-input" class="mb-1 block text-sm font-medium text-gray-700">
							Paste Offer from Host
						</label>
						<textarea
							id="offer-input"
							bind:value={offerInput}
							placeholder="Paste the offer here..."
							class="h-32 w-full rounded-lg border border-gray-300 p-3 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
						></textarea>
					</div>

					<button
						onclick={handleAcceptOffer}
						disabled={isLoading}
						class="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						{isLoading ? 'Creating Answer...' : 'Create Answer'}
					</button>
				</div>
			{:else}
				<div>
					<label for="answer-display" class="mb-1 block text-sm font-medium text-gray-700">
						Your Answer (Share this with host)
					</label>
					<div class="relative">
						<textarea
							id="answer-display"
							readonly
							value={answer}
							class="h-32 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-xs"
						></textarea>
						<button
							onclick={() => copyToClipboard(answer)}
							class="absolute right-2 top-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
						>
							Copy
						</button>
					</div>
				</div>

				<div class="rounded-lg bg-blue-50 p-4 text-center">
					<p class="text-blue-700">Waiting for host to connect...</p>
				</div>
			{/if}
		</div>
	{/if}

	{#if error}
		<div class="rounded-lg bg-red-50 p-4">
			<p class="text-sm text-red-700">{error}</p>
		</div>
	{/if}

	{#if mode}
		<button
			onclick={() => {
				mode = null;
				offerInput = '';
				answerInput = '';
				error = '';
			}}
			class="w-full text-sm text-gray-600 hover:text-gray-800"
		>
			← Back
		</button>
	{/if}
</div>
