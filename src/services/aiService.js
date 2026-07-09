export async function generateAITrip(trip) {
  const prompt = `
Create a ${trip.days}-day travel itinerary.

Destination: ${trip.to}

Travel Style: ${trip.travelStyle}

Interest: ${trip.interest}

Budget: €${trip.budget}

Return only activities for each day.

Example:

Day 1
- Activity
- Activity
- Activity

Day 2
...
`;

  console.log(prompt);

  return prompt;
}