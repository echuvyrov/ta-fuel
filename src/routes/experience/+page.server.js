import { PrismaClient } from '@prisma/client'
import { get } from 'svelte/store';
import {currentDate} from '../stores.js';

const prisma = new PrismaClient()
var foodNutrition = "wait for it...";
var dbData = [];
var allFoods = [];
var currDate = "";

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ cookies }) => {

	currDate = get(currentDate);
	console.log("current date: " + JSON.stringify(currDate));

	await loadData();
	return {
		/**
		 * Get nutrition data from the server
		 */
		kcals: foodNutrition,
		rowData: dbData,
		foodReferences: allFoods,
		forDate: currDate
	};
};

async function loadData() {
	dbData = await prisma.foodLog.findMany();
	allFoods = await prisma.foodReference.findMany();
}

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Modify game state in reaction to a keypress. If client-side JavaScript
	 * is available, this will happen in the browser instead of here
	 */
	addfood: async ({ request, cookies }) => {

		const data = await request.formData();		
		const nutritionData = JSON.parse(data.get('food'));

		/* check if the object is empty */
		if (Object.keys(nutritionData).length === 0) {
			// do nothing
		} else {
			// add the food to the database
			const newFoodLogEntry = await prisma.foodLog.create({
				data: {
					food_name: nutritionData.food_name,
					food_qty: nutritionData.food_qty,
					fat_grams: nutritionData.fat_grams,
					carbs_grams: nutritionData.carbs_grams,
					protein_grams: nutritionData.protein_grams,
					kkcals: nutritionData.kkcals,
					feeding_date: currDate
				},
			})
		}

		return {
			location: '/foodlog'
		};
	}
};
