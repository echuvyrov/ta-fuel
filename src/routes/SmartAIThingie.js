import { json } from "@sveltejs/kit";

/* create a Utils class with a static method that parses the JSON response from GPT-3 */
export class SmartAIThingie {

    /* a function that calls GPT-3 and returns the result */
    static async ask(prompt) {

        var responseJSON = {}
		const response = await fetch('https://api.openai.com/v1/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + process.env.GPT3_API_KEY
			},
			body: JSON.stringify({
                model: 'text-davinci-003',
                prompt: prompt,
				max_tokens: 128,
				temperature: 1.0,
				top_p: 1,
				frequency_penalty: 0,
				presence_penalty: 0,
			})
		});

        var data = await response.json();
		return data;
    }

    static askForJSON(prompt) {
        // JSON returned is generally invalid due to string properties appened as ints, among other things
        //  so for right now, we'll simply skip packaging it as JSON
        // var modifiedPrompt = prompt + " returned as JSON";
        var modifiedPrompt = prompt + "";
        return this.ask(modifiedPrompt);
    }

    /* a function that calls DALL-E to generate an image and returns it as a base64 string */
    static async generateImage(food) {
        const prompt = "A photo of " + food + " using random style with words '" + food + "' in it"
        var responseJSON = {}
		const response = await fetch('https://api.openai.com/v1/images/generations', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + process.env.GPT3_API_KEY
			},
			body: JSON.stringify({
                prompt: prompt,
				n: 1,
				size: "256x256",
				response_format: "b64_json",
			})
		});

        var imageData = await response.json();
        var imageBase64 = imageData.data[0].b64_json;
		return imageBase64;
    }
}

/* create a Nutrition-specific class for generating GPT-3 prompts and evaluating them */
export class NutritionSmartAIThingie extends SmartAIThingie {

    /* declare a class-wide variable to hold the food name */
    static food_name = "";

    static async ask(prompt) {
        // not sure if there is/will be anything else to add to the nutrition-specific ask function
        var nutritionPrompt = prompt;
        return await super.ask(nutritionPrompt);
    }

    static async askForJSON(prompt) {
        this.food_name = prompt;
        var nutritionPrompt = "Show nutrition data for " + prompt + " and return it in the format: Food: Quantity: Calories: Fat: Carbs: Protein";
        var rawResponse = await super.askForJSON(nutritionPrompt);
        var parsedResponse = await this.parseResponse(rawResponse);
        var nutritionData = await this.parseNutrition(parsedResponse);

        return nutritionData;
    }

    /* a function to create a JSON object from a string with line breaks as separators for different elements */
    static async parseResponse(rawResponse) {
        console.log("rawResponse: " + JSON.stringify(rawResponse));
        var parsedResponse = {};
        var lines = rawResponse.choices[0].text.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.indexOf(":") > -1) {
                var key = line.substring(0, line.indexOf(":"));
                var value = line.substring(line.indexOf(":") + 1);
                parsedResponse[key] = value;
            } else if (line.indexOf("-") > -1) {
                var key = line.substring(0, line.indexOf("-"));
                var value = line.substring(line.indexOf("-") + 1);
                parsedResponse[key] = value;
            }

        }
        return parsedResponse;
    }

    static parseNutrition(parsedResponse) {
        var nutritionData = {};
        nutritionData.food_name = this.food_name;
        /* check if JSON element exists */
        if (parsedResponse["Calories"]) {
            //remove all non-numeric characters from the string but keep the decimal point
            nutritionData["kkcals"] = parseFloat(parsedResponse["Calories"].replace(/[^0-9.]/g, ''));
        } else {
            nutritionData["kkcals"] = 0
        }
        if (parsedResponse["Quantity"]) {
            //remove all non-numeric characters from the string but keep the decimal point
            nutritionData["food_qty"] = parseFloat(parsedResponse["Quantity"].replace(/[^0-9.]/g, ''));
        } else {
            nutritionData["food_qty"] = 0
        }
        if (parsedResponse["Calories"]) {
            //remove all non-numeric characters from the string but keep the decimal point
            nutritionData["kkcals"] = parseFloat(parsedResponse["Calories"].replace(/[^0-9.]/g, ''));
        } else {
            nutritionData["kkcals"] = 0
        }
        if (parsedResponse["Protein"]) {
            nutritionData["protein_grams"] = parseFloat(parsedResponse["Protein"].replace(/[^0-9.]/g, ''));
        } else {
            nutritionData["protein_grams"] = 0
        }
        if (parsedResponse["Fat"]) {
            nutritionData["fat_grams"] = parseFloat(parsedResponse["Fat"].replace(/[^0-9.]/g, ''));
        } else {
            nutritionData["fat_grams"] = 0
        }
        if (parsedResponse["Carbs"]) {
            nutritionData["carbs_grams"] = parseFloat(parsedResponse["Carbs"].replace(/[^0-9.]/g, ''));
        } else {
            nutritionData["carbs_grams"] = 0
        }

        return nutritionData;
    }

}