import OpenAI from "openai";
//const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const assistantId = "asst_CfgCiohBmLngjeWc0j1etS9n";   // ← replace with yours
export const openai     = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
// ------ one-time bootstrap (already run) ------
//async function bootstrap() {
//  const a = await openai.beta.assistants.create({
//   name: "Chat-Coach",
//    model: "gpt-4o-mini",
//    instructions:
//      "You help users track meals & workouts. "
//      + "When a user logs a meal, call the function `logMeal`.",
//    tools: [
//      {
//       type: "function",
//        function: {
//          name: "logMeal",
//          description: "Store a meal and its nutrition macros",
//          parameters: {
//            type: "object",
//            properties: { raw: { type: "string" } },
//            required: ["raw"],
//          },
//        },
//      },
//    ],
//  });
//  console.log("Assistant ID:", a.id);
//}
//
//bootstrap(); 
