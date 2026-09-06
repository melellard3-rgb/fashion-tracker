import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const requireSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
};

export const appStorage = {
  async load(defaultBrands, defaultRanked) {
    const client = requireSupabase();
    const [{ data: brands, error: brandsError }, { data: rankings, error: rankingsError }] = await Promise.all([
      client.from("brands").select("id, name, notes, categories").order("id"),
      client.from("rankings").select("brand_id, tier, position").order("position"),
    ]);
    if (brandsError) throw brandsError;
    if (rankingsError) throw rankingsError;

    if (!brands.length) {
      const { error: seedBrandsError } = await client.from("brands").upsert(defaultBrands);
      if (seedBrandsError) throw seedBrandsError;
      const { error: seedRankingsError } = await client.from("rankings").upsert(defaultRanked.map((entry, position) => ({
        brand_id: entry.id,
        tier: entry.tier,
        position,
      })));
      if (seedRankingsError) throw seedRankingsError;
      return { brands: defaultBrands, ranked: defaultRanked };
    }

    const normalizedBrands = brands.map((brand) => ({
      ...brand,
      categories: Array.isArray(brand.categories) && brand.categories.length ? brand.categories : ["Clothing"],
    }));
    const categoryUpdates = normalizedBrands.filter((brand, index) => JSON.stringify(brand.categories) !== JSON.stringify(brands[index].categories));
    if (categoryUpdates.length) {
      const { error: categoryError } = await client.from("brands").upsert(categoryUpdates);
      if (categoryError) throw categoryError;
    }

    const ranked = rankings.map(({ brand_id, tier }) => ({ id: brand_id, tier }));
    const rankedIds = new Set(ranked.map((entry) => entry.id));
    const missingRankings = normalizedBrands
      .filter((brand) => !rankedIds.has(brand.id))
      .map((brand, index) => ({ brand_id: brand.id, tier: "F", position: ranked.length + index }));
    if (missingRankings.length) {
      const { error: repairError } = await client.from("rankings").upsert(missingRankings);
      if (repairError) throw repairError;
      ranked.push(...missingRankings.map(({ brand_id, tier }) => ({ id: brand_id, tier })));
    }

    return { brands: normalizedBrands, ranked };
  },

  async save(brands, ranked) {
    const client = requireSupabase();
    const { error: brandsError } = await client.from("brands").upsert(brands);
    if (brandsError) throw brandsError;

    const { error: deleteError } = await client.from("rankings").delete().neq("brand_id", -1);
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
      brand_id: entry.id,
      tier: entry.tier,
      position,
    })));
    if (error) throw error;
  },

  async getSizeChart(brandId) {
    const { data, error } = await requireSupabase()
      .from("size_charts")
      .select("data")
      .eq("brand_id", brandId)
      .maybeSingle();
    if (error) throw error;
    return data?.data || null;
  },

  async setSizeChart(brandId, data) {
    const { error } = await requireSupabase()
      .from("size_charts")
      .upsert({ brand_id: brandId, data, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  async getPriceGuide(brandId) {
    const { data, error } = await requireSupabase()
      .from("price_guides")
      .select("data")
      .eq("brand_id", brandId)
      .maybeSingle();
    if (error) throw error;
    return data?.data || null;
  },

  async setPriceGuide(brandId, data) {
    const { error } = await requireSupabase()
      .from("price_guides")
      .upsert({ brand_id: brandId, data, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  async getProfile(defaultProfile) {
    const client = requireSupabase();
    const { data, error } = await client
      .from("profile")
      .select("name, measurements")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      const profile = { name: data.name || defaultProfile.name, measurements: data.measurements || {} };
      if (!data.name) await this.setProfile(profile);
      return profile;
    }

    const { error: seedError } = await client.from("profile").insert({
      id: 1,
      name: defaultProfile.name,
      measurements: defaultProfile.measurements,
    });
    if (seedError) throw seedError;
    return defaultProfile;
  },

  async setProfile(profile) {
    const { error } = await requireSupabase()
      .from("profile")
      .upsert({
        id: 1,
        name: profile.name || "",
        measurements: profile.measurements || {},
        updated_at: new Date().toISOString(),
      });
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

  async getSavedFits() {
    const { data, error } = await requireSupabase()
      .from("saved_fits")
      .select("*")
      .order("saved_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((fit) => ({ ...fit, confirmed_fit: fit.confirmed_fit || "Not yet confirmed" }));
  },

  async uploadFitPhoto(file, fitId) {
    const client = requireSupabase();
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${fitId}.${extension}`;
    const { error } = await client.storage.from("fit-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
    if (error) throw error;
    return client.storage.from("fit-photos").getPublicUrl(path).data.publicUrl;
  },

  async saveFit(fit) {
    const { data, error } = await requireSupabase()
      .from("saved_fits")
      .insert(fit)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateFitConfirmation(id, confirmedFit) {
    const { data, error } = await requireSupabase()
      .from("saved_fits")
      .update({ confirmed_fit: confirmedFit })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteFit(id) {
    const { error } = await requireSupabase().from("saved_fits").delete().eq("id", id);
    if (error) throw error;
  },
};

export const isSupabaseConfigured = Boolean(supabase);
