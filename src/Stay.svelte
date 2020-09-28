<script>
	import { createEventDispatcher } from "svelte";
	import Lazy from 'svelte-lazy';

	let dispatch = createEventDispatcher();

	export let detail;
</script>

<style type="text/postcss">
	.img-stay {
		height: 270px;
	}
	.badge {
		padding: 6px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: bold;
		@apply text-gray-800 mr-2 border border-gray-800 text-center uppercase;
	}
</style>

<div class="w-full rounded overflow-hidden">
	<Lazy height={270} fadeOptions={{ delay: 250 }} class="shimmer rounded-largest">
		<img
		class="w-full rounded-largest img-stay object-center object-cover"
		src={detail.photo}
		alt={detail.title} />
	</Lazy>
	<a href="#" class="grid grid-cols-1 row-gap-1 mt-3">
		<div class="flex justify-between items-center select-none">
			<div class="text-gray-500 text-xs truncate py-2">
				{#if detail.superHost}
					<span class="badge">super host</span>
				{/if}
				<span class="min-w-0 truncate">
					{detail.type} {detail.beds ? ` . ${detail.beds} beds` : ''}
				</span>
			</div>
			<div class="text-gray-700 flex items-center py-2">
				<span class="material-icons text-red-500">grade</span>
				<span class="text-sm">{detail.rating}</span>
			</div>
		</div>
		<div class="font-semibold min-w-0 truncate text-sm">{detail.title}</div>
	</a>
</div>
