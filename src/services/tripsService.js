import { supabase } from "../lib/supabaseClient";

// Yeni bir gezi kaydet
export async function saveTrip(userId, tripData, aiPlan) {
  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: userId,
      from_city: tripData.from,
      to_city: tripData.to,
      days: Number(tripData.days),
      budget: Number(tripData.budget),
      travel_style: tripData.travelStyle,
      interest: tripData.interest,
      language: tripData.language,
      plan: aiPlan,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Kullanıcının kayıtlı gezilerini getir
export async function getTrips(userId) {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Bir geziyi sil
export async function deleteTrip(tripId) {
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) throw error;
}