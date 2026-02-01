<script lang="ts">
	import type { ConnectionState } from '$lib/webrtc/types';

	let {
		connectionState,
		myPeerId,
		errorMessage,
		onInitialize,
		onConnect,
		onLocalMode
	}: {
		connectionState: ConnectionState;
		myPeerId: string;
		errorMessage: string;
		onInitialize: (isHost: boolean) => void;
		onConnect: (peerId: string) => void;
		onLocalMode?: () => void;
	} = $props();

	let mode = $state<'host' | 'join' | null>(null);
	let peerIdInput = $state('');
	let error = $state('');

	async function handleHost() {
		mode = 'host';
		onInitialize(true);
	}

	async function handleJoin() {
		mode = 'join';
		onInitialize(false);
	}

	async function handleConnect() {
		if (!peerIdInput.trim()) {
			error = 'Please enter a Peer ID';
			return;
		}

		error = '';
		onConnect(peerIdInput.trim());
	}

	async function copyPeerId() {
		try {
			await navigator.clipboard.writeText(myPeerId);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	$effect(() => {
		if (errorMessage) {
			error = errorMessage;
		}
	});
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
		<div class="space-y-4">
			{#if onLocalMode}
				<button
					onclick={onLocalMode}
					class="w-full rounded-lg border-2 border-green-400 bg-green-50 px-6 py-8 font-medium text-green-800 transition-colors hover:border-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
				>
					<div class="text-xl font-semibold">Play on Same Device</div>
					<div class="mt-2 text-sm text-green-700">Pass and play with a friend</div>
				</button>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-white px-2 text-gray-500">or play online</span>
					</div>
				</div>
			{/if}

			<div class="grid grid-cols-2 gap-4">
				<button
					onclick={handleHost}
					class="rounded-lg border-2 border-gray-300 bg-white px-6 py-8 font-medium text-gray-700 transition-colors hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<div class="text-xl font-semibold">Host Game</div>
					<div class="mt-2 text-sm text-gray-600">Create a new game</div>
				</button>

				<button
					onclick={handleJoin}
					class="rounded-lg border-2 border-gray-300 bg-white px-6 py-8 font-medium text-gray-700 transition-colors hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<div class="text-xl font-semibold">Join Game</div>
					<div class="mt-2 text-sm text-gray-600">Join an existing game</div>
				</button>
			</div>
		</div>
	{:else if mode === 'host'}
		<div class="space-y-4">
			<div class="text-center">
				<h2 class="text-xl font-semibold text-gray-800">Host a Game</h2>
				<p class="text-sm text-gray-600">Share your Peer ID with another player</p>
			</div>

			{#if myPeerId}
				<div>
					<label for="peer-id-display" class="mb-1 block text-sm font-medium text-gray-700">
						Your Peer ID (Share this)
					</label>
					<div class="relative">
						<input
							id="peer-id-display"
							type="text"
							readonly
							value={myPeerId}
							class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pr-20 font-mono text-sm"
						/>
						<button
							onclick={copyPeerId}
							class="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
						>
							Copy
						</button>
					</div>
				</div>

				<div class="rounded-lg bg-blue-50 p-4 text-center">
					<p class="text-blue-700">Waiting for player to connect...</p>
				</div>
			{:else}
				<div class="text-center">
					<div class="flex justify-center">
						<div
							class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
						></div>
					</div>
					<p class="mt-2 text-sm text-gray-600">Generating your Peer ID...</p>
				</div>
			{/if}
		</div>
	{:else if mode === 'join'}
		<div class="space-y-4">
			<div class="text-center">
				<h2 class="text-xl font-semibold text-gray-800">Join a Game</h2>
				<p class="text-sm text-gray-600">Enter the host's Peer ID</p>
			</div>

			{#if myPeerId}
				<div>
					<label for="peer-id-input" class="mb-1 block text-sm font-medium text-gray-700">
						Host's Peer ID
					</label>
					<input
						id="peer-id-input"
						type="text"
						bind:value={peerIdInput}
						placeholder="Enter peer ID..."
						class="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
					/>
				</div>

				<button
					onclick={handleConnect}
					class="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					Connect
				</button>
			{:else}
				<div class="text-center">
					<div class="flex justify-center">
						<div
							class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
						></div>
					</div>
					<p class="mt-2 text-sm text-gray-600">Initializing...</p>
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
				peerIdInput = '';
				error = '';
			}}
			class="w-full text-sm text-gray-600 hover:text-gray-800"
		>
			← Back
		</button>
	{/if}
</div>
