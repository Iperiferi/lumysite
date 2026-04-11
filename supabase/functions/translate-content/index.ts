import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData.user) throw new Error("Not authenticated");
    const userId = userData.user.id;

    // Fetch business first to get ID
    const { data: business } = await supabase
      .from("businesses")
      .select("id, short_description, about_text, cta_text")
      .eq("owner_id", userId)
      .single();
    if (!business) throw new Error("Business not found");
    const bid = business.id;

    // Fetch all related content in parallel
    const [
      { data: services },
      { data: accommodations },
      { data: experiences },
      { data: events },
      { data: news },
      { data: faq },
      { data: menu },
      { data: testimonials },
    ] = await Promise.all([
      supabase.from("services").select("id, name, description").eq("business_id", bid),
      supabase.from("accommodations").select("id, name, description").eq("business_id", bid),
      supabase.from("experiences").select("id, name, description").eq("business_id", bid),
      supabase.from("events").select("id, title, description").eq("business_id", bid),
      supabase.from("news").select("id, title, content").eq("business_id", bid),
      supabase.from("faq").select("id, question, answer").eq("business_id", bid),
      supabase.from("menu").select("id, title, content").eq("business_id", bid).maybeSingle(),
      supabase.from("testimonials").select("id, content, author_name").eq("business_id", bid),
    ]);

    // Build translation payload — only non-empty values
    const payload: Record<string, any> = {};
    if (business.short_description) payload.short_description = business.short_description;
    if (business.about_text) payload.about_text = business.about_text;
    if (business.cta_text) payload.cta_text = business.cta_text;
    if (services?.length) payload.services = services.map(s => ({ id: s.id, name: s.name, description: s.description || "" }));
    if (accommodations?.length) payload.accommodations = accommodations.map(a => ({ id: a.id, name: a.name, description: a.description || "" }));
    if (experiences?.length) payload.experiences = experiences.map(e => ({ id: e.id, name: e.name, description: e.description || "" }));
    if (events?.length) payload.events = events.map(e => ({ id: e.id, title: e.title, description: e.description || "" }));
    if (news?.length) payload.news = news.map(n => ({ id: n.id, title: n.title, content: n.content || "" }));
    if (faq?.length) payload.faq = faq.map(f => ({ id: f.id, question: f.question, answer: f.answer }));
    if (menu?.title || menu?.content) payload.menu = { title: menu?.title || "", content: menu?.content || "" };
    if (testimonials?.length) payload.testimonials = testimonials.map(t => ({ id: t.id, content: t.content, author_name: t.author_name }));

    if (Object.keys(payload).length === 0) {
      return new Response(JSON.stringify({ success: true, message: "Nothing to translate" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[translate-content] Translating payload keys:", Object.keys(payload));

    // Call Claude
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 8096,
        system: `You are a professional translator specializing in Swedish tourism and hospitality businesses.
Translate the provided Swedish text to natural, warm, and inviting English — as if written by a native English speaker.
Do not translate proper nouns, place names, or business names.
Preserve line breaks and formatting.
Return ONLY a valid JSON object with exactly the same structure and keys as the input. No extra text, no markdown, no code blocks — just raw JSON.`,
        messages: [{
          role: "user",
          content: `Translate this JSON from Swedish to English:\n${JSON.stringify(payload, null, 2)}`,
        }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error("[translate-content] Anthropic API error:", err);
      throw new Error(`Anthropic API error: ${err}`);
    }

    const anthropicData = await anthropicRes.json();
    const stopReason = anthropicData.stop_reason;
    const rawText = anthropicData.content?.[0]?.text ?? "";

    console.log("[translate-content] Stop reason:", stopReason, "Response length:", rawText.length);

    if (stopReason === "max_tokens") {
      console.error("[translate-content] Response truncated — max_tokens reached");
      throw new Error("Translation response was too long and got cut off. Try saving with less content at once.");
    }

    // Extract JSON robustly — handle any accidental markdown wrapping
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[translate-content] Could not find JSON in response:", rawText.slice(0, 200));
      throw new Error("Could not parse translation response");
    }
    const translated = JSON.parse(jsonMatch[0]);

    // Persist translations
    await supabase
      .from("businesses")
      .update({ translations_en: translated })
      .eq("owner_id", userId);

    console.log("[translate-content] Done — saved translations_en for user:", userId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("[translate-content] Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
