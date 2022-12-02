<script>
    export let data;	
	import { onDestroy, onMount } from 'svelte';

	/* sveltekit fetch method to update the record */
	async function updateRecord(data) {
		const jsonData = JSON.stringify(data);
		const res = await fetch('/food/updaterecord', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: jsonData
		});
		const json = await res.json();
		if (!res.ok) {
			throw Error(json.message);
		}
		return json;
	}

</script>

<!-- create a 5-column flex box and add foodReference items to each column -->
<div class="grid">
	<!-- iterate over all items in data.foodReferences -->
	{#each data.foodReferences as foodReference, i}
		<form action="?/addfood" method = "POST">
			<div class="grid-item">
				<input type="hidden" value={JSON.stringify(foodReference)} name="food">
				<!-- image from base64 string -->
				<button>
					<img src="data:image/png;base64, {foodReference.imageBase64}" />
				</button>			
			</div>
		</form>
	{/each}
</div>

<!--

<div>
	<div style="display: flex; flex-direction: row; place-content: stretch center; box-sizing: border-box; width: 100%; gap: 16px;">
		

	</div>
</div>
-->

<style>

input {
        height: 220px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		box-sizing: border-box;
		text-transform: lowercase;
		border: none;
		font-size: calc(0.08 * var(--width));
		border-radius: 2px;
		background: white;
		margin: 0;
		color: rgba(0, 0, 0, 0.7);
	}

button  {
	width: 266px;
    height: 266px;
    padding: 5px;
    background: #d95753;
    border: 0;
}

.btn-size {
    width: 30px;
    height: 30px;
}

.img-size img {
    width: 75px;
    height: 75px;
}

/* Grid */
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	grid-gap: 0.8rem;
}

</style>