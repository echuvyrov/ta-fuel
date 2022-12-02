import {NutritionSmartAIThingie, SmartAIThingie} from '../SmartAIThingie.js';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
var foodNutrition = "wait for it...";
var allFoods = [];

/** @type {import('./$types').PageServerLoad} */
export const load = ({ cookies }) => {

	loadData();
	return {
		/**
		 * Get nutrition data from the server
		 */
		kcals: foodNutrition,
		rowData: allFoods
	};
};

async function loadData() {
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
		const food = data.get('food');

		// check whether the food exists in the foodReference table
		const foodReferenceEntry = await prisma.foodReference.findFirst({
			where: {
				food_name: food
			}
		})

		//add the food to the foodReference table if it doesn't exist
		if (foodReferenceEntry == null) {
			// look up food on OpenAI
			var nutritionData = await NutritionSmartAIThingie.askForJSON(food);
			var imageBase64 = await NutritionSmartAIThingie.generateImage(food);
			const newFoodReferenceEntry = await prisma.foodReference.create({
				data: {
					food_name: nutritionData.food_name,
					food_qty: nutritionData.food_qty,
					fat_grams: nutritionData.fat_grams,
					carbs_grams: nutritionData.carbs_grams,
					protein_grams: nutritionData.protein_grams,
					kkcals: nutritionData.kkcals,
					imageBase64: imageBase64
				},
			})
		}

		allFoods = await prisma.foodReference.findMany();
	}
};
