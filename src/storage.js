import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Keep the user signed in across reloads and refresh the token in the
        // background, so a login is never forced by the client.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "bqi-auth",
      },
    })
  : null;

const requireSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
};

let cachedUserId = null;

const requireUserId = async () => {
  const client = requireSupabase();
  if (cachedUserId) return cachedUserId;
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data?.user) throw new Error("You need to be signed in to do that.");
  cachedUserId = data.user.id;
  return cachedUserId;
};

export const appAuth = {
  async getSession() {
    const client = requireSupabase();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    cachedUserId = data.session?.user?.id || null;
    return data.session || null;
  },

  onAuthChange(callback) {
    const client = requireSupabase();
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      cachedUserId = session?.user?.id || null;
      callback(session || null);
    });
    return () => data.subscription.unsubscribe();
  },

  async sendMagicLink(email) {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  },

  async signOut() {
    cachedUserId = null;
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
  },
};

export const appStorage = {
  // ---- Onboarding ----------------------------------------------------------

  async getSetup() {
    const client = requireSupabase();
    const userId = await requireUserId();
    const { data, error } = await client
      .from("user_setup")
      .select("seeded, seed_choice")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;

    // The auth trigger normally creates this row; insert it if it is missing.
    const { error: insertError } = await client
      .from("user_setup")
      .insert({ user_id: userId, seeded: false });
    if (insertError && insertError.code !== "23505") throw insertError;
    return { seeded: false, seed_choice: null };
  },

  async seedCatalog(choice, defaultBrands, defaultRanked) {
    const client = requireSupabase();
    const userId = await requireUserId();

    if (choice === "base") {
      const { error: brandsError } = await client
        .from("brands")
        .upsert(defaultBrands.map((brand) => ({ ...brand, user_id: userId })));
      if (brandsError) throw brandsError;

      const { error: rankingsError } = await client
        .from("rankings")
        .upsert(defaultRanked.map((entry, position) => ({
          user_id: userId,
          brand_id: entry.id,
          tier: entry.tier,
          position,
        })));
      if (rankingsError) throw rankingsError;
    }

    const { error } = await client
      .from("user_setup")
      .upsert({ user_id: userId, seeded: true, seed_choice: choice });
    if (error) throw error;

    return choice === "base"
      ? { brands: defaultBrands, ranked: defaultRanked }
      : { brands: [], ranked: [] };
  },

  // ---- Brands and rankings -------------------------------------------------

  async load() {
    const client = requireSupabase();
    const userId = await requireUserId();
    const [{ data: brands, error: brandsError }, { data: rankings, error: rankingsError }] = await Promise.all([
      client.from("brands").select("id, name, notes, categories").eq("user_id", userId).order("id"),
      client.from("rankings").select("brand_id, tier, position").eq("user_id", userId).order("position"),
    ]);
    if (brandsError) throw brandsError;
    if (rankingsError) throw rankingsError;

    const normalizedBrands = (brands || []).map((brand) => ({
      ...brand,
      categories: Array.isArray(brand.categories) && brand.categories.length ? brand.categories : ["Clothing"],
    }));

    const ranked = (rankings || []).map(({ brand_id, tier }) => ({ id: brand_id, tier }));
    const rankedIds = new Set(ranked.map((entry) => entry.id));
    const missingRankings = normalizedBrands
      .filter((brand) => !rankedIds.has(brand.id))
      .map((brand, index) => ({ user_id: userId, brand_id: brand.id, tier: "F", position: ranked.length + index }));
    if (missingRankings.length) {
      const { error: repairError } = await client.from("rankings").upsert(missingRankings);
      if (repairError) throw repairError;
      ranked.push(...missingRankings.map(({ brand_id, tier }) => ({ id: brand_id, tier })));
    }

    return { brands: normalizedBrands, ranked };
  },

  async save(brands, ranked) {
    const client = requireSupabase();
    const userId = await requireUserId();

    const { error: brandsError } = await client
      .from("brands")
      .upsert(brands.map((brand) => ({ ...brand, user_id: userId })));
    if (brandsError) throw brandsError;

    // Replace this user's rankings only — never touch anyone else's rows.
    const { error: deleteError } = await client.from("rankings").delete().eq("user_id", userId);
    if (deleteError) throw deleteError;
    if (!ranked.length) return;

    const rankedIds = new Set(ranked.map((entry) => entry.id));
    const completeRanked = [
      ...ranked,
      ...brands
        .filter((brand) => !rankedIds.has(brand.id))
        .map((brand) => ({ id: brand.id, tier: "F" })),
    ];
    const { error } = await client.from("rankings").upsert(completeRanked.map((entry, position) => ({
      user_id: userId,
      brand_id: entry.id,
      tier: entry.tier,
      position,
    })));
    if (error) throw error;
  },

  // Fully removes a brand from this user's list. Rankings, size charts, and
  // price guides cascade away with it.
  async deleteBrand(brandId) {
    const client = requireSupabase();
    const userId = await requireUserId();
    const { error } = await client.from("brands").delete().eq("user_id", userId).eq("id", brandId);
    if (error) throw error;
  },

  // ---- Cached lookups ------------------------------------------------------

  async getSizeChart(brandId) {
    const userId = await requireUserId();
    const { data, error } = await requireSupabase()
      .from("size_charts")
      .select("data")
      .eq("user_id", userId)
      .eq("brand_id", brandId)
      .maybeSingle();
    if (error) throw error;
    return data?.data || null;
  },

  async setSizeChart(brandId, data) {
    const userId = await requireUserId();
    const { error } = await requireSupabase()
      .from("size_charts")
      .upsert({ user_id: userId, brand_id: brandId, data, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  async getPriceGuide(brandId) {
    const userId = await requireUserId();
    const { data, error } = await requireSupabase()
      .from("price_guides")
      .select("data")
      .eq("user_id", userId)
      .eq("brand_id", brandId)
      .maybeSingle();
    if (error) throw error;
    return data?.data || null;
  },

  async setPriceGuide(brandId, data) {
    const userId = await requireUserId();
    const { error } = await requireSupabase()
      .from("price_guides")
      .upsert({ user_id: userId, brand_id: brandId, data, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  async getSizeCharts(brandId) {
    const cached = await this.getSizeChart(brandId);
    if (!cached) return null;
    return Array.isArray(cached) ? cached : [cached];
  },

  async setSizeCharts(brandId, charts) {
    await this.setSizeChart(brandId, charts);
  },

  // ---- Profile -------------------------------------------------------------

  async getProfile(defaultProfile) {
    const client = requireSupabase();
    const userId = await requireUserId();
    const { data, error } = await client
      .from("profile")
      .select("name, measurements")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      return { name: data.name || "", measurements: data.measurements || {} };
    }

    const { error: seedError } = await client.from("profile").insert({
      user_id: userId,
      name: defaultProfile.name,
      measurements: defaultProfile.measurements,
    });
    if (seedError && seedError.code !== "23505") throw seedError;
    return defaultProfile;
  },

  async setProfile(profile) {
    const userId = await requireUserId();
    const { error } = await requireSupabase()
      .from("profile")
      .upsert({
        user_id: userId,
        name: profile.name || "",
        measurements: profile.measurements || {},
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;
  },

  // ---- Saved fits ----------------------------------------------------------

  async getSavedFits() {
    const client = requireSupabase();
    const userId = await requireUserId();
    const { data, error } = await client
      .from("saved_fits")
      .select("*")
      .eq("user_id", userId)
      .order("saved_at", { ascending: false });
    if (error) throw error;
    return Promise.all((data || []).map(async (fit) => ({
      ...fit,
      confirmed_fit: fit.confirmed_fit || "Not yet confirmed",
      photo_url: await signPhoto(client, fit),
    })));
  },

  async uploadFitPhoto(file, fitId) {
    const client = requireSupabase();
    const userId = await requireUserId();
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    // The leading user folder is what the storage RLS policies key off.
    const path = `${userId}/${fitId}.${extension}`;
    const { error } = await client.storage.from("fit-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
    if (error) throw error;
    return path;
  },

  async saveFit(fit) {
    const client = requireSupabase();
    const userId = await requireUserId();
    const { data, error } = await client
      .from("saved_fits")
      .insert({ ...fit, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return { ...data, photo_url: await signPhoto(client, data) };
  },

  async updateFitConfirmation(id, confirmedFit) {
    const client = requireSupabase();
    const userId = await requireUserId();
    const { data, error } = await client
      .from("saved_fits")
      .update({ confirmed_fit: confirmedFit })
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return { ...data, photo_url: await signPhoto(client, data) };
  },

  async deleteFit(id) {
    const client = requireSupabase();
    const userId = await requireUserId();
    const { data } = await client
      .from("saved_fits")
      .select("photo_path")
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();
    if (data?.photo_path) {
      await client.storage.from("fit-photos").remove([data.photo_path]);
    }
    const { error } = await client.from("saved_fits").delete().eq("user_id", userId).eq("id", id);
    if (error) throw error;
  },
};

// The bucket is private, so a stored path has to be exchanged for a temporary
// signed URL. Legacy rows that still hold a public photo_url keep working.
async function signPhoto(client, fit) {
  if (!fit?.photo_path) return fit?.photo_url || null;
  const { data, error } = await client.storage
    .from("fit-photos")
    .createSignedUrl(fit.photo_path, 60 * 60 * 8);
  if (error) return fit.photo_url || null;
  return data?.signedUrl || fit.photo_url || null;
}

export const isSupabaseConfigured = Boolean(supabase);
