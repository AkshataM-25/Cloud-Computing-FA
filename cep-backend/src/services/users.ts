import Supabase from "./supabase.js";

export interface Data {
  user_id: string;
}

export interface User {
  user_id?: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_pic_url?: string | null;
  location?: string;
  climate_zone?: string;
  mobile?: string;
  notification_preferences?: {
    watering: boolean;
    fertilizing: boolean;
    disease_alerts: boolean;
  } | null;
}

class UserService {
  private supabase: Supabase;

  constructor() {
    this.supabase = new Supabase();
  }

  async getUser(uid: string) {
    try {
      const { data, error } = await this.supabase.client
        .from("users")
        .select("*")
        .eq("user_id", uid)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async createUser(userData: User) {
    try {
      if (!userData.user_id) {
        throw new Error("Missing user_id");
      }

      const trimmedUsername = (userData.username || "").trim();
      const safeUsername = trimmedUsername || (userData.email ? userData.email.split("@")[0] : "user");

      const fullName = `${userData.first_name || ""} ${userData.last_name || ""}`.trim();
      const fallbackParts = (fullName || safeUsername).trim().split(/\s+/).filter(Boolean);
      const firstName = (userData.first_name || fallbackParts[0] || safeUsername).toString();
      const lastName = (userData.last_name || fallbackParts.slice(1).join(" ") || "").toString();

      const payload: User = {
        ...userData,
        username: safeUsername,
        first_name: firstName,
        last_name: lastName,
      };

      const { data, error } = await this.supabase.client
        .from("users")
        // Upsert prevents "duplicate key" failures on re-register/retry.
        .upsert([payload], { onConflict: "user_id" })
        .select();

      if (error) {
        throw new Error(error.message);
      }

      return data && data.length > 0 ? data[0] : payload;
    } catch (error: any) {
      console.error("Supabase insert error:", error);
      throw error;
    }
  }
}

export default UserService;