<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

<script>
    export let data;
	import { onDestroy, onMount } from 'svelte';
	import { Grid } from 'ag-grid-community';
	import Typeahead from "svelte-typeahead";

	import 'ag-grid-community/styles//ag-grid.css';
	import 'ag-grid-community/styles//ag-theme-alpine.css';
	import { Chasing } from 'svelte-loading-spinners';

	var domNode;
    var grid;
	var isLoading = true;

	var domNodeTotals;
    var gridTotals;

	const today = data.today;
	// get tomorrow from today + 1 day without time zone

	// tomorrow is today + 1 day
	var tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const tomorrowString = tomorrow.toISOString().split('T')[0];

	// yesterday is today - 1 day
	var yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const yesterdayString = yesterday.toISOString().split('T')[0];

	const typeaheadData = data.foodReferences;
	const typeaheadExtract = (item) => item.food_name;

	const submitFood = (e) => {
		if (e.key == 'Enter') {
			/* populate hidden form value and submit form programmatically */
			const foodEntered = document.getElementById('foodautocomplete').value;
			document.forms["foodForm"].elements["food"].value = foodEntered;
			document.forms["foodForm"].submit();
			isLoading = true;
		}	
	}

	let columnDefs = [
		{headerName: "Food", field: "food_name", editable: true},
		{headerName: "Qty", field: "food_qty", editable: true},
		{headerName: "Fat, g", field: "fat_grams", editable: true},
		{headerName: "Carbs, g", field: "carbs_grams", editable: true},
		{headerName: "Protein, g", field: "protein_grams", editable: true},
		{headerName: "Kcals", field: "kkcals"}
	];

	let totalsColumnDefs = [
		{headerName: "Totals", field: "label", editable: false,
			cellStyle: params => {
					if (params.value === 'Target Totals') {
						//mark police cells as red
						return {color: 'white', backgroundColor: 'lightblue'};
					} else if (params.value === 'Difference') {
						//mark police cells as red
						return {color: 'white', backgroundColor: 'red'};
					} else {
						return {color: 'white', backgroundColor: 'grey'};
					}
					return null;
				},
		}, 
		{headerName: "", field: "", editable: false},
		{headerName: "Fat, g", field: "fat_grams", editable: false},
		{headerName: "Carbs, g", field: "carbs_grams", editable: false},
		{headerName: "Protein, g", field: "protein_grams", editable: false},
		{headerName: "Kcals", field: "kkcals", editable: false}
	];

	// create data for AgGrid totalsColumnDefs
	let totalsData = [
		data.targetTotals,
		data.calculatedTotals,
		data.differenceTotals
	];

	// let the grid know which columns and what data to use
	let options = {
		columnDefs: columnDefs,
		rowData: data.rowData,
		rowSelection: 'single',
		onCellValueChanged: function(params)  {
			// alert('wtf ' + JSON.stringify(params.data));
			updateRecord(params.data);
  		},
	};

	// let the Totals grid know which columns and what data to use
	let totalsOptions = {
		columnDefs: totalsColumnDefs,
		rowData: totalsData
	};

	/* sveltekit fetch method to update the record */
	async function updateRecord(data) {
		const jsonData = JSON.stringify(data);
		const res = await fetch('/foodlog/updaterecord', {
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

	onMount(() => {
        grid = new Grid(domNode, options);
        gridTotals = new Grid(domNodeTotals, totalsOptions);
		isLoading = false;
    });

    onDestroy(() => {
        if (grid) {
            grid.destroy();
        }
        if (gridTotals) {
            gridTotals.destroy();
        }
	});

</script>

<h1>Hello food!</h1>
<form action="?/addfood" method = "POST">
	<Typeahead 
		id = "foodautocomplete"
		name="foodautocomplete"
		autofocus
		hideLabel
		focusAfterSelect
		placeholder="Whatcha eatin'?"
		data={typeaheadData} 
		extract={typeaheadExtract}
		on:keydown={submitFood}
	/>	
	</form>

<form id="foodForm" action="?/addfood" method = "POST">
<input
type="hidden"
name="food"
/>
</form>

<!-- svg icon of rectangle pointing to the left -->
<center>
	<a data-sveltekit-reload href="/foodlog/{yesterdayString}"><i class="fa fa-arrow-circle-left" style="font-size:36px; color:blue; padding:10px"></i></a>
	<div class="foodheader">Food Log for {today}</div>
	
	<a data-sveltekit-reload href="/foodlog/{tomorrowString}"><i class="fa fa-arrow-circle-right" style="font-size:36px; color:blue; padding:10px"></i></a>
</center>
{#if isLoading}
	<!-- align in the middle of the screen and on top-->
	<div style="display: flex; justify-content: center; padding: 10px;">
		<Chasing size="60" color="#FF3E00" unit="px" duration="1s" />
	</div>
{/if}

<div class="grid">
	<!-- iterate over all items in data.foodReferences -->
	{#each data.foodReferences as foodReference}
		<form action="?/addfood" method = "POST">

			<input type="hidden" value={foodReference.food_name} name="food">
			<!-- image from base64 string -->
			<button>
				<img src="data:image/png;base64, {foodReference.imageBase64}" style="max-height: 62px; max-width: 62px;" />
			</button>
			</form>
	{/each}
</div>

<!-- add AgGrid component with grid options -->
<div style="display: flex; justify-content: center; align-items: center;">
<div
    id="datagrid"
    bind:this={domNode}
    class="ag-theme-alpine"
    style="height: 170vh; width: 100%;"
/>
</div>

<h3>Totals:</h3>
<!-- add Totals AgGrid component with grid options -->
<div style="display: flex; justify-content: center; align-items: center;">
	<div
		id="totals"
		bind:this={domNodeTotals}
		class="ag-theme-alpine"
		style="height: 22vh; width: 100%;"
	/>
</div>
	

<style>
.foodheader {
	margin: 5px;
	display: inline;
	font-size: 24px;
}


.col1 {
	float: left;
	width: 80%;
}

.col2 {
	float: right;
	width: 20%;
}

input {
        height: 50px;
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
	width: 75px;
    height: 75px;
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
	grid-template-columns: repeat(auto-fit, minmax(75px, 75px));
	grid-gap: 0.8rem;
}

</style>